package com.trosmart.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class FileStorageUtil {

    @Value("${app.upload.base-dir:uploads}")
    private String baseDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Lưu file vào thư mục con, trả về URL truy cập.
     * @param file MultipartFile từ request
     * @param subDir ví dụ: "avatars", "qr", "proofs", "posts"
     */
    public String store(MultipartFile file, String subDir) throws IOException {
        validateFile(file);

        Path dir = Paths.get(baseDir, subDir);
        Files.createDirectories(dir);

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + ext;
        Path target = dir.resolve(filename);

        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + subDir + "/" + filename;
    }

    /** Xóa file cũ (không throw nếu không tồn tại) */
    public void delete(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            String relativePath = fileUrl.replaceFirst("^/uploads/", "");
            Path path = Paths.get(baseDir, relativePath);
            Files.deleteIfExists(path);
        } catch (IOException ignored) {}
    }

    // ── Private ──────────────────────────────────────────────
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (image/*)");
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5 MB
            throw new IllegalArgumentException("Kích thước file tối đa 5MB");
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}
