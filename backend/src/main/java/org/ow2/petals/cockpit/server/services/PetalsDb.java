/**
 * Copyright (C) 2017 Linagora
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package org.ow2.petals.cockpit.server.services;

import java.util.concurrent.ExecutorService;
import java.util.function.Consumer;

import javax.inject.Inject;
import javax.inject.Named;

import org.jooq.Configuration;
import org.jooq.impl.DSL;
import org.ow2.petals.cockpit.server.CockpitApplication;

import co.paralleluniverse.common.util.CheckedCallable;
import co.paralleluniverse.fibers.FiberAsync;
import co.paralleluniverse.fibers.SuspendExecution;
import co.paralleluniverse.strands.Strand;
import javaslang.Function0;
import javaslang.Function1;

public class PetalsDb {

    private final ExecutorService executor;

    private final Configuration jooq;

    @Inject
    public PetalsDb(Configuration jooq, @Named(CockpitApplication.BLOCKING_TASK_ES) ExecutorService executor) {
        this.jooq = jooq;
        this.executor = executor;
    }

    @SuppressWarnings("unused")
    private <R> R runMaybeBlocking(Function0<R> s) throws SuspendExecution, InterruptedException {
        if (Strand.isCurrentFiber()) {
            try {
                return FiberAsync.runBlocking(executor, new CheckedCallable<R, RuntimeException>() {
                    @Override
                    public R call() {
                        return s.apply();
                    }
                });
            } catch (InterruptedException e) {
                // TODO until https://github.com/puniverse/quasar/issues/245 is fixed, we shouldn't interrupt
                // runBlocking because the actual behaviour is not the expected one!
                throw new AssertionError("This should not be interrupted!", e);
            }
        } else {
            return s.apply();
        }
    }

    public <R> R runTransaction(Configuration conf, Function1<Configuration, R> transaction)
            throws SuspendExecution, InterruptedException {
        return runMaybeBlocking(() -> DSL.using(conf).transactionResult(transaction::apply));
    }

    public void runTransaction(Configuration conf, Consumer<Configuration> t)
            throws SuspendExecution, InterruptedException {
        runTransaction(conf, c -> {
            t.accept(c);
            return null;
        });
    }

    public <R> R runTransaction(Function1<Configuration, R> t) throws SuspendExecution, InterruptedException {
        return runTransaction(jooq, t);
    }

    public void runTransaction(Consumer<Configuration> t) throws SuspendExecution, InterruptedException {
        runTransaction(jooq, t);
    }
}
