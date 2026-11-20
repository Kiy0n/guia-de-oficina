mod local_server;

use std::path::PathBuf;
use tauri::Manager;

struct ApiServerState {
    base_url: String,
}

#[tauri::command]
fn get_api_base_url(state: tauri::State<'_, ApiServerState>) -> String {
    state.base_url.clone()
}

#[tauri::command]
fn abrir_url_externa(url: String) -> Result<(), String> {
    let trimmed = url.trim();
    if !(trimmed.starts_with("http://127.0.0.1:") || trimmed.starts_with("https://")) {
        return Err("URL não permitida: apenas http://127.0.0.1: ou https:// são aceitas.".to_string());
    }
    const FORBIDDEN_CHARS: [char; 8] = ['"', '|', '>', '<', '^', '%', ';', '`'];
    if trimmed
        .chars()
        .any(|c| c.is_control() || FORBIDDEN_CHARS.contains(&c))
    {
        return Err("URL contém caracteres de controle ou metacaracteres não permitidos.".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        let escaped = trimmed.replace('&', "^&");
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &escaped])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn()
            .map_err(|e| format!("Falha ao abrir URL externa no Windows: {e}"))?;
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Falha ao abrir URL externa no macOS: {e}"))?;
        return Ok(());
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        std::process::Command::new("xdg-open")
            .arg(trimmed)
            .spawn()
            .map_err(|e| format!("Falha ao abrir URL externa no Linux: {e}"))?;
        return Ok(());
    }
}

fn resolve_resource_dirs(app: &tauri::App) -> (PathBuf, PathBuf) {
    if let Ok(res_dir) = app.path().resource_dir() {
        let manuals = res_dir.join("manuals");
        let index = res_dir.join("manuals-index");
        if manuals.exists() {
            return (manuals, index);
        }
    }

    // Fallback para desenvolvimento (`tauri dev`), apontando para a raiz do projeto
    let dev_root = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .map(PathBuf::from)
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

    (
        dev_root.join("public").join("manuals"),
        dev_root.join("data").join("manuals-index"),
    )
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let (manuals_dir, index_dir) = resolve_resource_dirs(app);
            let base_url = local_server::start_server(manuals_dir, index_dir)
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

            app.manage(ApiServerState { base_url });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_api_base_url, abrir_url_externa])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar aplicação Guia de Oficina");
}
