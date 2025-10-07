package com.copilot.review.models;

import lombok.Data;
@Data
public class Product {
    private int productId;
    private String productName;
    private String productDescription;
    private BigDecimal price;
    private String dimension;
}
