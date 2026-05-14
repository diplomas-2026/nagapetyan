package com.github.danbel.nagapetyanapi.service;

import com.github.danbel.nagapetyanapi.dto.AuthResponse;
import com.github.danbel.nagapetyanapi.dto.AuthUserResponse;
import com.github.danbel.nagapetyanapi.dto.LoginRequest;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.AuthAccount;
import com.github.danbel.nagapetyanapi.model.AuthSession;
import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private static final String PASSWORD_SALT = "nagapetyan-demo-salt";

    private final InMemoryStore store;

    public AuthService(InMemoryStore store) {
        this.store = store;
    }

    public AuthResponse login(LoginRequest request) {
        AuthAccount account = store.findAccountByLogin(request.login());
        if (account == null || !account.passwordHash().equals(hashPassword(request.password()))) {
            throw new ResponseStatusException(UNAUTHORIZED, "Неверный логин или пароль");
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        store.saveSession(new AuthSession(
                token,
                account.role(),
                account.organizationId(),
                account.login(),
                account.fullName()));

        AuthUserResponse user = new AuthUserResponse(
                null,
                account.login(),
                account.fullName(),
                null,
                null,
                account.role(),
                account.organizationId(),
                null);
        return new AuthResponse(token, user);
    }

    public ActorContext requireContext(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new ResponseStatusException(UNAUTHORIZED, "Требуется авторизация");
        }

        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring("Bearer ".length()).trim()
                : authorizationHeader.trim();
        AuthSession session = store.getSession(token);
        if (session == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Сессия не найдена");
        }
        return new ActorContext(session.role(), session.organizationId());
    }

    public String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((password + PASSWORD_SALT).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Не удалось захешировать пароль", exception);
        }
    }

    public void ensurePasswordMatches(OrganizationMember member, String password) {
        if (password != null && !password.isBlank()) {
            member.setPasswordHash(hashPassword(password));
        }
    }
}
