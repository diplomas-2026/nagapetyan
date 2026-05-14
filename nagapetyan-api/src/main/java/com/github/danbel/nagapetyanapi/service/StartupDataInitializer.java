package com.github.danbel.nagapetyanapi.service;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StartupDataInitializer implements CommandLineRunner {

    private final InMemoryStore store;

    public StartupDataInitializer(InMemoryStore store) {
        this.store = store;
    }

    @Override
    public void run(String... args) {
        store.seedDemoData();
    }
}
