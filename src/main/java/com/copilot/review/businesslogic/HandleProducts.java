package com.copilot.review.businesslogic;


import org.springframework.stereotype.Service;

import com.copilot.review.models.Product;

import reactor.core.publisher.ParallelFlux;
import reactor.core.publisher.Mono;
import java.time.Duration;

@Service
public class HandleProducts {

    public ParallelFlux<Product> handle(ParallelFlux<Product> products)
    {
        return products.flatMap(x -> {
            if (x.getId() % 2 == 0) {
                x.setPrice((float) (x.getPrice() * 16.2));
                return Mono.delay(Duration.ofSeconds(1))
                        .doOnNext(t -> System.out.println("thread Slept for 1 sec" + Thread.currentThread().getName()))
                        .thenReturn(x);
            } else {
                return Mono.just(x);
            }
        });
    }

    
}
