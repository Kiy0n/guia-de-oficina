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
        .invoke_handler(tauri::generate_handler![get_api_base_url])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar aplicação Guia de Oficina");
}
