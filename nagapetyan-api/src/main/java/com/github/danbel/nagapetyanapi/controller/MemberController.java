package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.MemberRequest;
import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.service.AuthService;
import com.github.danbel.nagapetyanapi.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/organizations/{organizationId}/members")
public class MemberController {

    private final MemberService memberService;
    private final AuthService authService;

    public MemberController(MemberService memberService, AuthService authService) {
        this.memberService = memberService;
        this.authService = authService;
    }

    @GetMapping
    public List<MemberResponse> list(@RequestHeader(value = "Authorization", required = false) String authorization,
                                     @PathVariable Long organizationId) {
        return memberService.listMemberResponses(authService.requireContext(authorization), organizationId);
    }

    @GetMapping("/{memberId}")
    public MemberResponse get(@RequestHeader(value = "Authorization", required = false) String authorization,
                              @PathVariable Long organizationId,
                              @PathVariable Long memberId) {
        return memberService.getMemberResponse(authService.requireContext(authorization), organizationId, memberId);
    }

    @PostMapping
    public MemberResponse create(@RequestHeader(value = "Authorization", required = false) String authorization,
                                 @PathVariable Long organizationId,
                                 @Valid @RequestBody MemberRequest request) {
        return memberService.createMemberResponse(authService.requireContext(authorization), organizationId, request);
    }

    @PutMapping("/{memberId}")
    public MemberResponse update(@RequestHeader(value = "Authorization", required = false) String authorization,
                                 @PathVariable Long organizationId,
                                 @PathVariable Long memberId,
                                 @Valid @RequestBody MemberRequest request) {
        return memberService.updateMemberResponse(authService.requireContext(authorization), organizationId, memberId, request);
    }

    @DeleteMapping("/{memberId}")
    public void delete(@RequestHeader(value = "Authorization", required = false) String authorization,
                       @PathVariable Long organizationId,
                       @PathVariable Long memberId) {
        memberService.deleteMember(authService.requireContext(authorization), organizationId, memberId);
    }
}
