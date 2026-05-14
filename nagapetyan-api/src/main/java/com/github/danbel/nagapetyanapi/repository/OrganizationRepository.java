package com.github.danbel.nagapetyanapi.repository;

import com.github.danbel.nagapetyanapi.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findAllByOrderByIdAsc();
}
