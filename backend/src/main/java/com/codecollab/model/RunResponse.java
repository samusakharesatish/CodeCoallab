package com.codecollab.model;

public class RunResponse {
    private String output;

    public RunResponse() {
    }

    public RunResponse(String output) {
        this.output = output;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }
}