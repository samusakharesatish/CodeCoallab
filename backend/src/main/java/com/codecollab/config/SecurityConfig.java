package com.codecollab.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})

            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()   // ✅ login/register
                .requestMatchers("/room/**").permitAll()   // 🔥 FIXED (IMPORTANT)
                .requestMatchers("/ws/**").permitAll()
                .anyRequest().authenticated()
            )

            .httpBasic(httpBasic -> httpBasic.disable());

        return http.build();
    }
}