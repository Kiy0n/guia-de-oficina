use percent_encoding::{percent_decode_str, utf8_percent_encode, AsciiSet, NON_ALPHANUMERIC};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs::{self, File};
use std::io::{Cursor, Read, Seek, SeekFrom};
use std::path::{Component, Path, PathBuf};
use std::sync::Arc;
use std::thread;
use std::time::Instant;
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};
use unicode_normalization::UnicodeNormalization;

const MAX_SNIPPETS_POR_PAGINA: usize = 3;

const PATH_SEGMENT_ENCODE_SET: &AsciiSet = &NON_ALPHANUMERIC
    .remove(b'-')
    .remove(b'_')
    .remove(b'.')
    .remove(b'!')
    .remove(b'~')
    .remove(b'*')
    .remove(b'\'')
    .remove(b'(')
    .remove(b')');

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ManualPdfItem {
    id: String,
    marca: String,
    modelo_slug: String,
    ano_ou_faixa: Option<String>,
    nome_arquivo: String,
    titulo_amigavel: String,
    tamanho_bytes: u64,
    url: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PaginaManualExtraida {
    numero: usize,
    texto: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ManualIndexCache {
    manual_id: String,
    total_paginas: usize,
    tem_texto_pesquisavel: bool,
    extraido_em: String,
    paginas: Vec<PaginaManualExtraida>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ResultadoBuscaPagina {
    pagina: usize,
    ocorrencias: usize,
    snippets: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RespostaBuscaManual {
    manual_id: String,
    query: String,
    tem_texto_pesquisavel: bool,
    total_paginas: usize,
    total_ocorrencias: usize,
    resultados: Vec<ResultadoBuscaPagina>,
}

struct ServerContext {
    manuals_dir: PathBuf,
    index_dir: PathBuf,
    started_at: Instant,
}

pub fn start_server(manuals_dir: PathBuf, index_dir: PathBuf) -> Result<String, String> {
    let server = Server::http("127.0.0.1:0")
        .map_err(|e| format!("Falha ao iniciar servidor HTTP local: {e}"))?;

    let port = server
        .server_addr()
        .to_ip()
        .map(|addr| addr.port())
        .ok_or_else(|| "Não foi possível obter a porta do servidor HTTP local".to_string())?;

    let base_url = format!("http://127.0.0.1:{port}");
    let ctx = Arc::new(ServerContext {
        manuals_dir,
        index_dir,
        started_at: Instant::now(),
    });

    thread::spawn(move || {
        for request in server.incoming_requests() {
            let ctx = Arc::clone(&ctx);
            thread::spawn(move || {
                handle_request(request, &ctx);
            });
        }
    });

    Ok(base_url)
}

fn cors_headers() -> Vec<Header> {
    vec![
        Header::from_bytes("Access-Control-Allow-Origin", "*").unwrap(),
        Header::from_bytes("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS").unwrap(),
        Header::from_bytes("Access-Control-Allow-Headers", "Range, Accept, Content-Type").unwrap(),
        Header::from_bytes(
            "Access-Control-Expose-Headers",
            "Content-Length, Content-Range, Accept-Ranges",
        )
        .unwrap(),
    ]
}

fn respond_json<T: Serialize>(request: Request, status: u16, payload: &T) {
    let body = serde_json::to_vec(payload).unwrap_or_else(|_| b"{}".to_vec());
    let mut response = Response::from_data(body).with_status_code(StatusCode(status));
    response.add_header(Header::from_bytes("Content-Type", "application/json; charset=utf-8").unwrap());
    response.add_header(Header::from_bytes("Cache-Control", "no-store").unwrap());
    for h in cors_headers() {
        response.add_header(h);
    }
    let _ = request.respond(response);
}

fn respond_error(request: Request, status: u16, msg: &str) {
    respond_json(request, status, &serde_json::json!({ "error": msg }));
}

fn handle_request(request: Request, ctx: &ServerContext) {
    if request.method() == &Method::Options {
        let mut response = Response::empty(StatusCode(204));
        for h in cors_headers() {
            response.add_header(h);
        }
        let _ = request.respond(response);
        return;
    }

    let raw_url = request.url().to_string();
    let (path_raw, query_raw) = match raw_url.split_once('?') {
        Some((p, q)) => (p, q),
        None => (raw_url.as_str(), ""),
    };

    if path_raw == "/api/health" {
        let uptime = ctx.started_at.elapsed().as_secs();
        respond_json(
            request,
            200,
            &serde_json::json!({
                "status": "ok",
                "app": "Guia de Oficina",
                "env": "desktop",
                "uptime": uptime,
                "timestamp": format!("{uptime}s")
            }),
        );
        return;
    }

    if path_raw == "/api/manuais" {
        handle_list_manuais(request, ctx, query_raw);
        return;
    }

    if let Some(rest) = path_raw.strip_prefix("/api/manuais/") {
        if let Some(id_raw) = rest.strip_suffix("/indice") {
            let id = decode_uri_component(id_raw);
            handle_manual_indice(request, ctx, &id);
            return;
        }
        if let Some(id_raw) = rest.strip_suffix("/buscar") {
            let id = decode_uri_component(id_raw);
            handle_manual_buscar(request, ctx, &id, query_raw);
            return;
        }
        if let Some((id_raw, num_raw)) = rest.rsplit_once("/pagina/") {
            let id = decode_uri_component(id_raw);
            handle_manual_pagina(request, ctx, &id, num_raw);
            return;
        }
    }

    if let Some(rel_raw) = path_raw.strip_prefix("/manuals/") {
        handle_serve_pdf(request, ctx, rel_raw);
        return;
    }

    respond_error(request, 404, "Rota não encontrada.");
}

// ---------------------------------------------------------------------------
// Normalização, slugs, filtros e descoberta (espelho exato de server/index.ts)
// ---------------------------------------------------------------------------

fn strip_combining_marks(s: &str) -> String {
    s.nfd()
        .filter(|&c| !(('\u{0300}'..='\u{036f}').contains(&c)))
        .collect()
}

fn normalizar_texto_busca(texto: &str) -> String {
    let nfc: String = texto.nfc().collect();
    strip_combining_marks(&nfc).to_lowercase()
}

fn normalizar_marca(raw: &str) -> String {
    match raw.trim().to_lowercase().as_str() {
        "honda" => "Honda".to_string(),
        "yamaha" => "Yamaha".to_string(),
        "suzuki" => "Suzuki".to_string(),
        _ => raw.trim().to_string(),
    }
}

fn normalizar_slug_simples(valor: &str) -> String {
    let base = strip_combining_marks(valor).to_lowercase();
    let stripped = strip_brand_prefix(&base);
    stripped
        .chars()
        .filter(|c| c.is_ascii_alphanumeric())
        .collect()
}

fn strip_brand_prefix(s: &str) -> &str {
    for prefix in ["honda", "yamaha", "suzuki"] {
        if let Some(rest) = s.strip_prefix(prefix) {
            if let Some(after_sep) = rest.strip_prefix('-').or_else(|| rest.strip_prefix('_')) {
                return after_sep;
            }
            return rest;
        }
    }
    s
}

fn canonizar_slug_modelo(valor: &str) -> String {
    let simples = normalizar_slug_simples(valor);
    match simples.as_str() {
        "bros125" | "nxr125" => "nxr125bros".to_string(),
        "bros150" | "nxr150" => "nxr150bros".to_string(),
        "bros160" | "nxr160" => "nxr160bros".to_string(),
        "c100" | "c100biz" => "biz100".to_string(),
        "biz110" => "biz110i".to_string(),
        "ybr125fazer" => "fazer125".to_string(),
        "en125" => "yes125".to_string(),
        "gn125" => "intruder125".to_string(),
        "start160" => "cg160start".to_string(),
        _ => simples,
    }
}

fn modelos_casam(modelo_pdf_slug: &str, filtro_modelo: &str) -> bool {
    let a = canonizar_slug_modelo(modelo_pdf_slug);
    let b = canonizar_slug_modelo(filtro_modelo);
    if a.is_empty() || b.is_empty() {
        return true;
    }
    if a == b {
        return true;
    }
    if (a == "cg160start" && b == "cg160") || (a == "cg160" && b == "cg160start") {
        return false;
    }
    if a.len() >= 4 && b.contains(&a) {
        return true;
    }
    if b.len() >= 4 && a.contains(&b) {
        return true;
    }
    false
}

fn extrair_anos(texto: &str) -> Vec<i32> {
    let mut anos = Vec::new();
    let bytes = texto.as_bytes();
    let mut i = 0;
    while i + 4 <= bytes.len() {
        let is_start = i == 0 || !bytes[i - 1].is_ascii_alphanumeric();
        let is_end = i + 4 == bytes.len() || !bytes[i + 4].is_ascii_alphanumeric();
        if is_start && is_end && bytes[i..i + 4].iter().all(|b| b.is_ascii_digit()) {
            if let Ok(s) = std::str::from_utf8(&bytes[i..i + 4]) {
                if let Ok(ano) = s.parse::<i32>() {
                    if (1900..=2099).contains(&ano) {
                        anos.push(ano);
                    }
                }
            }
            i += 4;
            continue;
        }
        i += 1;
    }
    anos
}

fn anos_casam(ano_ou_faixa: Option<&str>, ano_inicio: Option<i32>, ano_fim: Option<i32>) -> bool {
    let Some(faixa) = ano_ou_faixa else {
        return true;
    };
    if ano_inicio.is_none() && ano_fim.is_none() {
        return true;
    }
    let anos = extrair_anos(faixa);
    if anos.is_empty() {
        return true;
    }
    let pdf_inicio = *anos.iter().min().unwrap();
    let pdf_fim = *anos.iter().max().unwrap();

    let q_inicio = ano_inicio.or(ano_fim).unwrap_or(pdf_inicio);
    let q_fim = ano_fim.or(ano_inicio).unwrap_or(pdf_fim);

    pdf_inicio <= q_fim && pdf_fim >= q_inicio
}

fn inferir_titulo_amigavel(nome_arquivo: &str) -> String {
    let sem_ext = if nome_arquivo.len() >= 4
        && nome_arquivo[nome_arquivo.len() - 4..].eq_ignore_ascii_case(".pdf")
    {
        &nome_arquivo[..nome_arquivo.len() - 4]
    } else {
        nome_arquivo
    };

    let mut base = String::with_capacity(sem_ext.len());
    let mut prev_underscore = false;
    for c in sem_ext.chars() {
        if c == '_' {
            if !prev_underscore {
                base.push(' ');
                prev_underscore = true;
            }
        } else {
            prev_underscore = false;
            base.push(c);
        }
    }
    let base = base.trim();
    let lower = strip_combining_marks(base).to_lowercase();

    if lower == "manual de servico"
        || lower == "manual servico"
        || lower == "manual-servico"
        || lower == "service manual"
        || lower == "service-manual"
    {
        return "Manual de Serviço".to_string();
    }
    if lower == "manual do proprietario"
        || lower == "manual proprietario"
        || lower == "manual-proprietario"
        || lower == "owner manual"
        || lower == "owner-manual"
    {
        return "Manual do Proprietário".to_string();
    }
    if lower == "catalogo de pecas"
        || lower == "catalogo pecas"
        || lower == "catalogo-pecas"
        || lower == "parts catalog"
        || lower == "parts-catalog"
    {
        return "Catálogo de Peças".to_string();
    }
    if lower.contains("servico") || lower.contains("service") || lower.contains("oficina") {
        return format!("Manual de Serviço — {base}");
    }
    if lower.contains("catalogo") || lower.contains("pecas") || lower.contains("parts") {
        return format!("Catálogo de Peças — {base}");
    }
    if lower.contains("proprietario") || lower.contains("owner") {
        return format!("Manual do Proprietário — {base}");
    }
    if lower.contains("eletric") || lower.contains("diagrama") {
        return format!("Diagrama Elétrico — {base}");
    }

    format!("Manual Oficial — {base}")
}

/// Espelho exato de `gerarNomeArquivoCache` em `server/manualsIndex.ts`.
fn gerar_nome_arquivo_cache(manual_id: &str) -> String {
    let sem_ext = if manual_id.len() >= 4
        && manual_id[manual_id.len() - 4..].eq_ignore_ascii_case(".pdf")
    {
        &manual_id[..manual_id.len() - 4]
    } else {
        manual_id
    };

    let sem_acentos = strip_combining_marks(sem_ext);

    // 1) [\\/]+ -> "__"
    let mut passo1 = String::with_capacity(sem_acentos.len() + 8);
    let mut em_sep = false;
    for c in sem_acentos.chars() {
        if c == '/' || c == '\\' {
            if !em_sep {
                passo1.push_str("__");
                em_sep = true;
            }
        } else {
            em_sep = false;
            passo1.push(c);
        }
    }

    // 2) [^a-zA-Z0-9._-]+ -> "-"
    let mut passo2 = String::with_capacity(passo1.len());
    let mut em_invalido = false;
    for c in passo1.chars() {
        if c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-' {
            em_invalido = false;
            passo2.push(c);
        } else if !em_invalido {
            passo2.push('-');
            em_invalido = true;
        }
    }

    // 3) -+ -> "-"
    let mut passo3 = String::with_capacity(passo2.len());
    let mut prev_dash = false;
    for c in passo2.chars() {
        if c == '-' {
            if !prev_dash {
                passo3.push('-');
                prev_dash = true;
            }
        } else {
            prev_dash = false;
            passo3.push(c);
        }
    }

    let trimmed = passo3.trim_matches(|c| c == '-' || c == '_').to_lowercase();
    if trimmed.is_empty() {
        "manual.json".to_string()
    } else {
        format!("{trimmed}.json")
    }
}

fn listar_pdfs_recursivo(dir_atual: &Path, base_dir: &Path, out: &mut Vec<ManualPdfItem>) {
    let Ok(entries) = fs::read_dir(dir_atual) else {
        return;
    };

    for entry in entries.flatten() {
        let path = entry.path();
        let Ok(ft) = entry.file_type() else {
            continue;
        };

        if ft.is_dir() {
            listar_pdfs_recursivo(&path, base_dir, out);
            continue;
        }

        if !ft.is_file() {
            continue;
        }

        let nome_arquivo = entry.file_name().to_string_lossy().to_string();
        if !nome_arquivo.to_lowercase().ends_with(".pdf") {
            continue;
        }

        let Ok(rel) = path.strip_prefix(base_dir) else {
            continue;
        };
        let partes: Vec<String> = rel
            .components()
            .filter_map(|c| match c {
                Component::Normal(os) => Some(os.to_string_lossy().to_string()),
                _ => None,
            })
            .collect();

        if partes.is_empty() {
            continue;
        }

        let id = partes.join("/");
        let marca_raw = partes.first().map(String::as_str).unwrap_or("Geral");
        let modelo_slug = if partes.len() >= 3 {
            partes[1].clone()
        } else {
            "geral".to_string()
        };
        let ano_ou_faixa = if partes.len() >= 4 {
            let joined = partes[2..partes.len() - 1].join("/");
            if joined.is_empty() {
                None
            } else {
                Some(joined)
            }
        } else {
            None
        };

        let tamanho_bytes = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
        let url_path = partes
            .iter()
            .map(|seg| utf8_percent_encode(seg, PATH_SEGMENT_ENCODE_SET).to_string())
            .collect::<Vec<_>>()
            .join("/");

        out.push(ManualPdfItem {
            id,
            marca: normalizar_marca(marca_raw),
            modelo_slug,
            ano_ou_faixa,
            titulo_amigavel: inferir_titulo_amigavel(&nome_arquivo),
            nome_arquivo,
            tamanho_bytes,
            url: format!("/manuals/{url_path}"),
        });
    }
}

fn localizar_manual_por_id(ctx: &ServerContext, id_param: &str) -> Option<ManualPdfItem> {
    let id_clean = id_param.trim().replace('\\', "/");
    if id_clean.is_empty() {
        return None;
    }

    let mut todos = Vec::new();
    listar_pdfs_recursivo(&ctx.manuals_dir, &ctx.manuals_dir, &mut todos);

    let id_lower = id_clean.to_lowercase();
    let slug_param = gerar_nome_arquivo_cache(&id_clean);

    todos
        .iter()
        .find(|m| m.id == id_clean)
        .or_else(|| todos.iter().find(|m| m.id.to_lowercase() == id_lower))
        .or_else(|| {
            todos
                .iter()
                .find(|m| gerar_nome_arquivo_cache(&m.id) == slug_param)
        })
        .cloned()
}

fn carregar_indice_cache(ctx: &ServerContext, manual_id: &str) -> Option<ManualIndexCache> {
    let cache_path = ctx.index_dir.join(gerar_nome_arquivo_cache(manual_id));
    let raw = fs::read_to_string(&cache_path).ok()?;
    serde_json::from_str::<ManualIndexCache>(&raw).ok()
}

fn parse_query_params(query: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for pair in query.split('&') {
        if pair.is_empty() {
            continue;
        }
        let (k, v) = match pair.split_once('=') {
            Some((k, v)) => (k, v),
            None => (pair, ""),
        };
        let key = decode_uri_component(&k.replace('+', " "));
        let val = decode_uri_component(&v.replace('+', " "));
        map.insert(key, val);
    }
    map
}

fn decode_uri_component(raw: &str) -> String {
    percent_decode_str(raw).decode_utf8_lossy().to_string()
}

// ---------------------------------------------------------------------------
// Handlers da API
// ---------------------------------------------------------------------------

fn handle_list_manuais(request: Request, ctx: &ServerContext, query_raw: &str) {
    let mut todos = Vec::new();
    listar_pdfs_recursivo(&ctx.manuals_dir, &ctx.manuals_dir, &mut todos);
    todos.sort_by(|a, b| a.id.to_lowercase().cmp(&b.id.to_lowercase()));

    let params = parse_query_params(query_raw);
    let marca_filtro = params
        .get("marca")
        .map(|s| s.trim().to_lowercase())
        .filter(|s| !s.is_empty());
    let modelo_filtro = params
        .get("modelo")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    let ano_inicio = params.get("anoInicio").and_then(|s| s.trim().parse::<i32>().ok());
    let ano_fim = params.get("anoFim").and_then(|s| s.trim().parse::<i32>().ok());

    let total_biblioteca = todos.len();
    let filtrados: Vec<ManualPdfItem> = todos
        .into_iter()
        .filter(|item| {
            if let Some(ref mf) = marca_filtro {
                if item.marca.to_lowercase() != *mf {
                    return false;
                }
            }
            if let Some(ref mod_f) = modelo_filtro {
                if !modelos_casam(&item.modelo_slug, mod_f) {
                    return false;
                }
            }
            if !anos_casam(item.ano_ou_faixa.as_deref(), ano_inicio, ano_fim) {
                return false;
            }
            true
        })
        .collect();

    respond_json(
        request,
        200,
        &serde_json::json!({
            "total": filtrados.len(),
            "totalBiblioteca": total_biblioteca,
            "manuais": filtrados
        }),
    );
}

fn handle_manual_indice(request: Request, ctx: &ServerContext, id_param: &str) {
    let Some(manual) = localizar_manual_por_id(ctx, id_param) else {
        respond_error(request, 404, "Manual PDF não encontrado.");
        return;
    };

    let Some(indice) = carregar_indice_cache(ctx, &manual.id) else {
        respond_error(request, 404, "Índice pré-gerado não encontrado para este manual.");
        return;
    };

    respond_json(
        request,
        200,
        &serde_json::json!({
            "manualId": indice.manual_id,
            "totalPaginas": indice.total_paginas,
            "temTextoPesquisavel": indice.tem_texto_pesquisavel,
            "extraidoEm": indice.extraido_em
        }),
    );
}

fn handle_manual_buscar(request: Request, ctx: &ServerContext, id_param: &str, query_raw: &str) {
    let params = parse_query_params(query_raw);
    let query = params.get("q").map(|s| s.trim()).unwrap_or("");

    if query.chars().count() < 2 {
        respond_error(
            request,
            400,
            "O parâmetro de busca \"q\" deve ter pelo menos 2 caracteres.",
        );
        return;
    }

    let Some(manual) = localizar_manual_por_id(ctx, id_param) else {
        respond_error(request, 404, "Manual PDF não encontrado.");
        return;
    };

    let Some(indice) = carregar_indice_cache(ctx, &manual.id) else {
        respond_error(request, 404, "Índice pré-gerado não encontrado para este manual.");
        return;
    };

    let resposta = buscar_no_indice(&indice, query);
    respond_json(request, 200, &resposta);
}

fn handle_manual_pagina(request: Request, ctx: &ServerContext, id_param: &str, num_raw: &str) {
    let Ok(numero) = num_raw.trim().parse::<usize>() else {
        respond_error(request, 400, "Número de página inválido.");
        return;
    };
    if numero < 1 {
        respond_error(request, 400, "Número de página inválido.");
        return;
    }

    let Some(manual) = localizar_manual_por_id(ctx, id_param) else {
        respond_error(request, 404, "Manual PDF não encontrado.");
        return;
    };

    let Some(indice) = carregar_indice_cache(ctx, &manual.id) else {
        respond_error(request, 404, "Índice pré-gerado não encontrado para este manual.");
        return;
    };

    if numero > indice.total_paginas {
        respond_error(
            request,
            400,
            &format!(
                "A página solicitada ({numero}) excede o total de páginas do manual ({}).",
                indice.total_paginas
            ),
        );
        return;
    }

    let texto = indice
        .paginas
        .get(numero - 1)
        .map(|p| p.texto.as_str())
        .unwrap_or("");

    respond_json(
        request,
        200,
        &serde_json::json!({
            "manualId": indice.manual_id,
            "pagina": numero,
            "totalPaginas": indice.total_paginas,
            "temTextoPesquisavel": indice.tem_texto_pesquisavel,
            "texto": texto
        }),
    );
}

// ---------------------------------------------------------------------------
// Busca full-text com normalização NFD e snippets contextuais
// ---------------------------------------------------------------------------

fn linearizar_texto(raw: &str) -> String {
    let nfc: String = raw.nfc().collect();
    let mut out = String::with_capacity(nfc.len());
    let mut em_espaco = false;
    for c in nfc.chars() {
        if c.is_whitespace() {
            if !out.is_empty() && !em_espaco {
                out.push(' ');
                em_espaco = true;
            }
        } else {
            em_espaco = false;
            out.push(c);
        }
    }
    if out.ends_with(' ') {
        out.pop();
    }
    out
}

/// Normaliza mantendo o mapeamento de cada caractere normalizado para o índice de caractere em `orig_chars`.
fn normalizar_com_mapa(orig_chars: &[char]) -> (Vec<char>, Vec<usize>) {
    let mut norm_chars = Vec::with_capacity(orig_chars.len());
    let mut orig_idx_map = Vec::with_capacity(orig_chars.len());

    for (idx, &ch) in orig_chars.iter().enumerate() {
        let mut s = String::new();
        s.push(ch);
        let stripped = strip_combining_marks(&s).to_lowercase();
        for nc in stripped.chars() {
            norm_chars.push(nc);
            orig_idx_map.push(idx);
        }
    }
    (norm_chars, orig_idx_map)
}

fn find_all_occurrences(haystack: &[char], needle: &[char]) -> Vec<(usize, usize)> {
    let mut res = Vec::new();
    if needle.is_empty() || needle.len() > haystack.len() {
        return res;
    }
    let mut cursor = 0;
    while cursor + needle.len() <= haystack.len() {
        if &haystack[cursor..cursor + needle.len()] == needle {
            res.push((cursor, needle.len()));
            cursor += needle.len();
        } else {
            cursor += 1;
        }
    }
    res
}

fn extrair_snippet(orig_chars: &[char], inicio_match: usize, tamanho_match: usize) -> (String, usize) {
    const JANELA_ANTES: usize = 65;
    const JANELA_DEPOIS: usize = 95;

    let total = orig_chars.len();
    let mut start = inicio_match.saturating_sub(JANELA_ANTES);
    let mut end = (inicio_match + tamanho_match + JANELA_DEPOIS).min(total);

    if start > 0 {
        let limit = inicio_match.min(start + 18);
        if let Some(rel) = orig_chars[start..limit].iter().position(|&c| c == ' ') {
            start = start + rel + 1;
        }
    }

    if end < total {
        let min_pos = (inicio_match + tamanho_match).max(end.saturating_sub(18));
        if min_pos < end {
            if let Some(rel) = orig_chars[min_pos..end].iter().rposition(|&c| c == ' ') {
                end = min_pos + rel;
            }
        }
    }

    let trecho: String = orig_chars[start..end].iter().collect();
    let trecho = trecho.trim();
    let prefixo = if start > 0 { "…" } else { "" };
    let sufixo = if end < total { "…" } else { "" };

    (format!("{prefixo}{trecho}{sufixo}"), end)
}

fn buscar_no_indice(indice: &ManualIndexCache, query_bruta: &str) -> RespostaBuscaManual {
    let query = query_bruta.trim().to_string();

    if !indice.tem_texto_pesquisavel {
        return RespostaBuscaManual {
            manual_id: indice.manual_id.clone(),
            query,
            tem_texto_pesquisavel: false,
            total_paginas: indice.total_paginas,
            total_ocorrencias: 0,
            resultados: Vec::new(),
        };
    }

    let mut seen = HashSet::new();
    let termos: Vec<Vec<char>> = normalizar_texto_busca(&query)
        .split_whitespace()
        .filter(|t| !t.is_empty() && seen.insert((*t).to_string()))
        .map(|t| t.chars().collect())
        .collect();

    if termos.is_empty() {
        return RespostaBuscaManual {
            manual_id: indice.manual_id.clone(),
            query,
            tem_texto_pesquisavel: true,
            total_paginas: indice.total_paginas,
            total_ocorrencias: 0,
            resultados: Vec::new(),
        };
    }

    let mut resultados = Vec::new();
    let mut total_ocorrencias = 0usize;

    for pagina in &indice.paginas {
        if pagina.texto.trim().is_empty() {
            continue;
        }

        let texto_linear = linearizar_texto(&pagina.texto);
        if texto_linear.is_empty() {
            continue;
        }

        let orig_chars: Vec<char> = texto_linear.chars().collect();
        let (norm_chars, orig_map) = normalizar_com_mapa(&orig_chars);

        let mut posicoes: Vec<(usize, usize)> = Vec::new();
        let mut contem_todos = true;

        for termo in &termos {
            let matches = find_all_occurrences(&norm_chars, termo);
            if matches.is_empty() {
                contem_todos = false;
                break;
            }
            for (norm_idx, len) in matches {
                let orig_start = orig_map.get(norm_idx).copied().unwrap_or(0);
                let orig_end = orig_map
                    .get(norm_idx + len.saturating_sub(1))
                    .copied()
                    .map(|v| v + 1)
                    .unwrap_or(orig_start + len);
                posicoes.push((orig_start, orig_end.saturating_sub(orig_start)));
            }
        }

        if !contem_todos || posicoes.is_empty() {
            continue;
        }

        posicoes.sort_by_key(|p| p.0);
        let ocorrencias_pagina = posicoes.len();
        total_ocorrencias += ocorrencias_pagina;

        let mut snippets = Vec::new();
        let mut ultimo_fim_janela: Option<usize> = None;

        for (start, len) in posicoes {
            if snippets.len() >= MAX_SNIPPETS_POR_PAGINA {
                break;
            }
            if let Some(ultimo_fim) = ultimo_fim_janela {
                if start < ultimo_fim.saturating_sub(20) {
                    continue;
                }
            }
            let (snippet, fim_janela) = extrair_snippet(&orig_chars, start, len);
            if !snippet.is_empty() {
                snippets.push(snippet);
                ultimo_fim_janela = Some(fim_janela);
            }
        }

        resultados.push(ResultadoBuscaPagina {
            pagina: pagina.numero,
            ocorrencias: ocorrencias_pagina,
            snippets,
        });
    }

    RespostaBuscaManual {
        manual_id: indice.manual_id.clone(),
        query,
        tem_texto_pesquisavel: true,
        total_paginas: indice.total_paginas,
        total_ocorrencias,
        resultados,
    }
}

// ---------------------------------------------------------------------------
// Servir PDFs com suporte a HTTP Range (206 Partial Content) + CORS
// ---------------------------------------------------------------------------

fn parse_range_header(header_val: &str, file_len: u64) -> Option<(u64, u64)> {
    let spec = header_val.trim().strip_prefix("bytes=")?;
    let first_range = spec.split(',').next()?.trim();
    let (start_s, end_s) = first_range.split_once('-')?;

    if file_len == 0 {
        return None;
    }

    if start_s.is_empty() {
        let suffix_len: u64 = end_s.parse().ok()?;
        if suffix_len == 0 {
            return None;
        }
        let start = file_len.saturating_sub(suffix_len);
        Some((start, file_len - 1))
    } else {
        let start: u64 = start_s.parse().ok()?;
        if start >= file_len {
            return None;
        }
        let end = if end_s.is_empty() {
            file_len - 1
        } else {
            end_s.parse::<u64>().ok()?.min(file_len - 1)
        };
        if start > end {
            return None;
        }
        Some((start, end))
    }
}

fn handle_serve_pdf(request: Request, ctx: &ServerContext, rel_raw: &str) {
    let mut candidate = ctx.manuals_dir.clone();
    for seg in rel_raw.split('/') {
        if seg.is_empty() {
            continue;
        }
        let decoded = decode_uri_component(seg);
        if decoded == "." || decoded == ".." || decoded.contains('/') || decoded.contains('\\') {
            respond_error(request, 400, "Caminho de manual inválido.");
            return;
        }
        candidate.push(decoded);
    }

    let Ok(base_canon) = fs::canonicalize(&ctx.manuals_dir) else {
        respond_error(request, 500, "Diretório de manuais indisponível.");
        return;
    };
    let Ok(file_canon) = fs::canonicalize(&candidate) else {
        respond_error(request, 404, "Arquivo PDF não encontrado.");
        return;
    };
    if !file_canon.starts_with(&base_canon) || !file_canon.is_file() {
        respond_error(request, 403, "Acesso negado.");
        return;
    }

    let Ok(meta) = fs::metadata(&file_canon) else {
        respond_error(request, 404, "Arquivo PDF não encontrado.");
        return;
    };
    let file_len = meta.len();

    let range_header = request
        .headers()
        .iter()
        .find(|h| h.field.equiv("Range"))
        .map(|h| h.value.as_str().to_string());

    let is_head = request.method() == &Method::Head;

    if let Some(range_val) = range_header {
        let Some((start, end)) = parse_range_header(&range_val, file_len) else {
            let mut resp = Response::empty(StatusCode(416));
            resp.add_header(
                Header::from_bytes("Content-Range", format!("bytes */{file_len}")).unwrap(),
            );
            for h in cors_headers() {
                resp.add_header(h);
            }
            let _ = request.respond(resp);
            return;
        };

        let chunk_len = end - start + 1;
        let mut resp = if is_head {
            Response::new(
                StatusCode(206),
                Vec::new(),
                Box::new(Cursor::new(Vec::<u8>::new())) as Box<dyn Read + Send>,
                Some(chunk_len as usize),
                None,
            )
        } else {
            let Ok(mut file) = File::open(&file_canon) else {
                respond_error(request, 500, "Erro ao abrir arquivo PDF.");
                return;
            };
            if file.seek(SeekFrom::Start(start)).is_err() {
                respond_error(request, 500, "Erro ao posicionar leitura do PDF.");
                return;
            }
            Response::new(
                StatusCode(206),
                Vec::new(),
                Box::new(file.take(chunk_len)) as Box<dyn Read + Send>,
                Some(chunk_len as usize),
                None,
            )
        };

        resp.add_header(Header::from_bytes("Content-Type", "application/pdf").unwrap());
        resp.add_header(Header::from_bytes("Content-Disposition", "inline").unwrap());
        resp.add_header(Header::from_bytes("Accept-Ranges", "bytes").unwrap());
        resp.add_header(
            Header::from_bytes(
                "Content-Range",
                format!("bytes {start}-{end}/{file_len}"),
            )
            .unwrap(),
        );
        for h in cors_headers() {
            resp.add_header(h);
        }
        let _ = request.respond(resp);
        return;
    }

    let mut resp = if is_head {
        Response::new(
            StatusCode(200),
            Vec::new(),
            Box::new(Cursor::new(Vec::<u8>::new())) as Box<dyn Read + Send>,
            Some(file_len as usize),
            None,
        )
    } else {
        let Ok(file) = File::open(&file_canon) else {
            respond_error(request, 500, "Erro ao abrir arquivo PDF.");
            return;
        };
        Response::new(
            StatusCode(200),
            Vec::new(),
            Box::new(file) as Box<dyn Read + Send>,
            Some(file_len as usize),
            None,
        )
    };

    resp.add_header(Header::from_bytes("Content-Type", "application/pdf").unwrap());
    resp.add_header(Header::from_bytes("Content-Disposition", "inline").unwrap());
    resp.add_header(Header::from_bytes("Accept-Ranges", "bytes").unwrap());
    for h in cors_headers() {
        resp.add_header(h);
    }
    let _ = request.respond(resp);
}
