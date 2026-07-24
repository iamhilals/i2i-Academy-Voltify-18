package com.voltify.core.dto;

public class ChatResponse {
    private String reply;
    private long timestamp;

    public ChatResponse() {
    }

    public ChatResponse(String reply, long timestamp) {
        this.reply = reply;
        this.timestamp = timestamp;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
