use encoding_rs;

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    let bytes = std::fs::read(&path).map_err(|e| format!("读取文件失败: {}", e))?;

    // 检测 BOM
    if bytes.len() >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF {
        return String::from_utf8(bytes[3..].to_vec())
            .map_err(|e| format!("UTF-8 解码失败: {}", e));
    }

    // 尝试 UTF-8
    if let Ok(s) = std::str::from_utf8(&bytes) {
        return Ok(s.to_string());
    }

    // 尝试 GBK
    let (decoded, _, had_errors) = encoding_rs::GBK.decode(&bytes);
    if !had_errors {
        return Ok(decoded.into_owned());
    }

    // 尝试 Shift-JIS
    let (decoded, _, had_errors) = encoding_rs::SHIFT_JIS.decode(&bytes);
    if !had_errors {
        return Ok(decoded.into_owned());
    }

    // 兜底：UTF-8 损失模式
    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
