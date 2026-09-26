package com.hackstreak.learning_platform.controller;

import com.hackstreak.learning_platform.dto.AuthRequestDto;
import com.hackstreak.learning_platform.dto.AuthResponseDto;
import com.hackstreak.learning_platform.dto.SignUpRequestDto;
import com.hackstreak.learning_platform.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@RequestBody AuthRequestDto req) {
        AuthResponseDto res = authService.login(req);
        if (!res.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDto> signup(@RequestBody SignUpRequestDto req) {
        AuthResponseDto res = authService.signup(req);
        if (!res.isSuccess()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponseDto> getMe(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponseDto(false, "Unauthenticated"));
        }
        AuthResponseDto res = authService.getMe(userId);
        if (!res.isSuccess()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
        return ResponseEntity.ok(res);
    }
}
