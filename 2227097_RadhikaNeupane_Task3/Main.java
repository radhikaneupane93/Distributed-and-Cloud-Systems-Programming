package com.example;
import akka.actor.ActorRef;
import akka.actor.ActorSystem;
import akka.actor.Props;

import java.util.Random;

public class Main {
    public static void main(String[] args) {
        ActorSystem system = ActorSystem.create("bank-system");

        ActorRef bankAccount = system.actorOf(Props.create(BankAccount.class), "bank-account");
        System.out.println("Initial balance is 100 £ " + bankAccount.path().name());

        Random random = new Random();
        for (int i = 0; i < 10; i++) {
            int amount = random.nextInt(2000) - 1000;
            if (amount >= 0) {
                bankAccount.tell(new Deposit(amount), ActorRef.noSender());
            } else {
                bankAccount.tell(new Withdrawal(-amount), ActorRef.noSender());
            }
        }

        system.terminate();
    }
}

