package com.hackstreak.learning_platform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class RootHealthController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> res = new HashMap<>();
        res.put("service", "SmartLearn Production API");
        res.put("status", "UP");
        res.put("version", "1.0.0");
        return res;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        return res;
    }
}
