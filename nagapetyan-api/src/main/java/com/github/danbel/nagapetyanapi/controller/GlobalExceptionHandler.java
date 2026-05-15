package com.github.danbel.nagapetyanapi.controller;

import com.github.danbel.nagapetyanapi.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(new ApiErrorResponse(exception.getReason(), Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiErrorResponse handleValidation(MethodArgumentNotValidException exception) {
        Set<String> fields = new LinkedHashSet<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fields.add(toFriendlyFieldName(fieldError.getField()));
        }

        String message = fields.isEmpty()
                ? "Проверьте заполнение формы"
                : "Заполните обязательные поля: " + fields.stream().limit(4).collect(Collectors.joining(", "));

        return new ApiErrorResponse(message, Instant.now());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiErrorResponse handleUnknown(Exception exception) {
        exception.printStackTrace();
        return new ApiErrorResponse("Внутренняя ошибка сервера", Instant.now());
    }

    private String toFriendlyFieldName(String field) {
        String normalized = field == null ? "" : field.toLowerCase();
        return switch (normalized) {
            case "name" -> "Название";
            case "inn" -> "ИНН";
            case "region" -> "Регион";
            case "description" -> "Описание";
            case "ownermode" -> "Способ назначения владельца";
            case "existingownerlogin" -> "Владелец из списка";
            case "owner.login", "login" -> "Логин";
            case "owner.password", "password" -> "Пароль";
            case "owner.fullname", "fullname" -> "ФИО";
            case "owner.email", "email" -> "Email";
            case "owner.position", "position" -> "Должность";
            case "shipmentnumber" -> "Номер отправления";
            case "routefrom" -> "Пункт отправки";
            case "routeto" -> "Пункт назначения";
            case "shippedat" -> "Дата отправки";
            case "planneddeliverydate" -> "Плановая дата доставки";
            case "weight" -> "Вес";
            case "cost" -> "Стоимость";
            case "status" -> "Статус";
            case "movementtype" -> "Тип этапа";
            case "title" -> "Название этапа";
            case "eventdate" -> "Дата этапа";
            case "role" -> "Роль";
            default -> field == null || field.isBlank()
                    ? "неизвестное поле"
                    : field.replace('.', ' ');
        };
    }
}
