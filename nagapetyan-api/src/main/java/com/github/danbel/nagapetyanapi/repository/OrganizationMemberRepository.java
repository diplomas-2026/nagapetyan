package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrganizationIdOrderByIdAsc(Long organizationId);

    Optional<OrganizationMember> findByLogin(String login);
}
