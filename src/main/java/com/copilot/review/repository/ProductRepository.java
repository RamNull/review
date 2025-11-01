package com.copilot.review.repository;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import com.copilot.review.models.Product;


@Repository
public interface ProductRepository extends ReactiveMongoRepository<Product, Integer> {
}
