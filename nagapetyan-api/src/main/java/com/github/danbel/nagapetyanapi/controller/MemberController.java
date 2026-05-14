package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.MemberRequest;
import com.github.danbel.nagapetyanapi.dto.MemberResponse;
import com.github.danbel.nagapetyanapi.model.ActorContext;
import com.github.danbel.nagapetyanapi.model.ActorRole;
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

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public List<MemberResponse> list(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                     @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                     @PathVariable Long organizationId) {
        return memberService.listMemberResponses(new ActorContext(role, organizationHeaderId), organizationId);
    }

    @PostMapping
    public MemberResponse create(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                 @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                 @PathVariable Long organizationId,
                                 @Valid @RequestBody MemberRequest request) {
        return memberService.createMemberResponse(new ActorContext(role, organizationHeaderId), organizationId, request);
    }

    @PutMapping("/{memberId}")
    public MemberResponse update(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                                 @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                                 @PathVariable Long organizationId,
                                 @PathVariable Long memberId,
                                 @Valid @RequestBody MemberRequest request) {
        return memberService.updateMemberResponse(new ActorContext(role, organizationHeaderId), organizationId, memberId, request);
    }

    @DeleteMapping("/{memberId}")
    public void delete(@RequestHeader(value = "X-Role", defaultValue = "SYSTEM_ADMIN") ActorRole role,
                       @RequestHeader(value = "X-Organization-Id", required = false) Long organizationHeaderId,
                       @PathVariable Long organizationId,
                       @PathVariable Long memberId) {
        memberService.deleteMember(new ActorContext(role, organizationHeaderId), organizationId, memberId);
    }
}
