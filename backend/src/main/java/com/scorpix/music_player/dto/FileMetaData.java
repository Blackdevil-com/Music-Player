package com.scorpix.music_player.dto;


public record FileMetaData(String filePath, Long fileSizeBytes, String mimeType) {
}
