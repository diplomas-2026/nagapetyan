package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.AuthSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionRepository extends JpaRepository<AuthSessionEntity, String> {
    void deleteByOrganizationId(Long organizationId);

    void deleteByLoginAndOrganizationId(String login, Long organizationId);
}
