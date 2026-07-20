package com.scorpix.music_player.exception;

public class FileStreamingException extends RuntimeException{

    public FileStreamingException(String message) {
        super(message);
    }

    public FileStreamingException(String message, Throwable cause) {
        super(message, cause);
    }
}
