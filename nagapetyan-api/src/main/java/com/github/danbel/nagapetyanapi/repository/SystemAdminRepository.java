package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.SystemAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SystemAdminRepository extends JpaRepository<SystemAdmin, Long> {
    Optional<SystemAdmin> findByLogin(String login);
}
