use std::path::{Path, PathBuf};
use tauri::{Emitter, Manager};
use tauri_plugin_fs::FsExt;

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
  app.exit(0);
}

/// Ne garde, parmi les arguments de ligne de commande, que les fichiers Markdown / texte qui existent
/// (double-clic sur un .md dans l'explorateur, « Ouvrir avec », ou `MyNotes fichier.md`).
/// Ces fichiers peuvent se trouver hors des dossiers autorisés par défaut (ex. un autre disque) :
/// on autorise donc leur lecture et leur écriture, pour que Ctrl+S fonctionne ensuite.
fn markdown_files_from_args<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  args: &[String],
  cwd: &str,
) -> Vec<String> {
  let mut files = Vec::new();
  for arg in args {
    if arg.starts_with('-') {
      continue;
    }
    let lower = arg.to_lowercase();
    if !(lower.ends_with(".md") || lower.ends_with(".markdown") || lower.ends_with(".txt")) {
      continue;
    }
    let raw = Path::new(arg);
    let full: PathBuf = if raw.is_absolute() {
      raw.to_path_buf()
    } else {
      Path::new(cwd).join(raw)
    };
    if !full.is_file() {
      continue;
    }
    let _ = app.fs_scope().allow_file(&full);
    files.push(full.to_string_lossy().into_owned());
  }
  files
}

/// Écrit une note sur le disque.
///
/// L'écriture passe par cette commande plutôt que par le plugin « fs » : le système de droits du plugin
/// peut refuser de réécrire un fichier créé pendant la session (le chemin autorisé à la création, quand
/// le fichier n'existait pas encore, ne correspond plus une fois le fichier créé). Résultat : « Enregistrer »
/// rouvrait « Enregistrer sous ». Par sécurité, seuls les fichiers .md, .markdown et .txt sont acceptés.
#[tauri::command]
fn write_text_file_at(path: String, content: String) -> Result<(), String> {
  let lower = path.to_lowercase();
  if !(lower.ends_with(".md") || lower.ends_with(".markdown") || lower.ends_with(".txt")) {
    return Err("Seuls les fichiers .md, .markdown et .txt peuvent être enregistrés.".into());
  }
  std::fs::write(&path, content).map_err(|e| format!("Impossible d'écrire « {path} » : {e}"))
}

/// Fichiers passés à MyNotes au moment de son lancement (appelé une fois par l'interface au démarrage).
#[tauri::command]
fn get_launch_files(app: tauri::AppHandle) -> Vec<String> {
  let args: Vec<String> = std::env::args().skip(1).collect();
  let cwd = std::env::current_dir()
    .map(|p| p.to_string_lossy().into_owned())
    .unwrap_or_default();
  markdown_files_from_args(&app, &args, &cwd)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  // Une seule fenêtre MyNotes à la fois : si on double-clique un autre .md alors que l'application
  // est déjà ouverte, le nouveau processus se ferme et transmet le fichier à la fenêtre existante.
  // (Ce plugin doit être enregistré en premier.)
  #[cfg(desktop)]
  {
    builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, cwd| {
      let files = markdown_files_from_args(app, &args, &cwd);
      if !files.is_empty() {
        let _ = app.emit("open-files", files);
      }
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
      }
    }));
  }

  builder
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .invoke_handler(tauri::generate_handler![close_app, get_launch_files, write_text_file_at])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
