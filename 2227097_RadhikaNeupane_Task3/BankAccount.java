package com.example;

import akka.actor.AbstractActor;

public class BankAccount extends AbstractActor {
    private int balance = 100;

    @Override
    public Receive createReceive() {
        return receiveBuilder()
                .match(Deposit.class, this::onDeposit)
                .match(Withdrawal.class, this::onWithdrawal)
                .build();
    }

    private void onDeposit(Deposit deposit) {
        balance += deposit.getAmount();
        System.out.println("Deposited " + deposit.getAmount() + ", new balance is " + balance + "£");
    }

    private void onWithdrawal(Withdrawal withdrawal) {
        balance -= withdrawal.getAmount();
        System.out.println("Withdrew " + withdrawal.getAmount() + ", new balance is " + balance+"£");
    }
}
