package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.service.AuthService;
import com.github.danbel.nagapetyanapi.service.MemberService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/owners")
public class OwnerController {

    private final MemberService memberService;
    private final AuthService authService;

    public OwnerController(MemberService memberService, AuthService authService) {
        this.memberService = memberService;
        this.authService = authService;
    }

    @GetMapping
    public List<MemberResponse> list(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return memberService.listOwnerResponses(authService.requireContext(authorization));
    }
}
