/**
 * Copyright (C) 2016 Linagora
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
package org.ow2.petals.cockpit.server.actors;

import java.util.concurrent.ExecutorService;
import java.util.function.Supplier;

import javax.inject.Inject;
import javax.inject.Named;

import org.ow2.petals.admin.api.ContainerAdministration;
import org.ow2.petals.admin.api.PetalsAdministration;
import org.ow2.petals.admin.api.PetalsAdministrationFactory;
import org.ow2.petals.admin.api.exception.ContainerAdministrationException;
import org.ow2.petals.admin.api.exception.DuplicatedServiceException;
import org.ow2.petals.admin.api.exception.MissingServiceException;
import org.ow2.petals.admin.topology.Domain;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.db.BusesDAO;
import org.ow2.petals.cockpit.server.db.WorkspacesDAO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.paralleluniverse.actors.BasicActor;
import co.paralleluniverse.common.util.CheckedCallable;
import co.paralleluniverse.fibers.FiberAsync;
import co.paralleluniverse.fibers.SuspendExecution;
import javaslang.Tuple2;
import javaslang.control.Option;

public abstract class CockpitActor<M> extends BasicActor<M, Void> {

    private static final Logger LOG = LoggerFactory.getLogger(CockpitActor.class);

    private static final long serialVersionUID = 4078882623710907546L;

    @Inject
    @Named(CockpitApplication.PETALS_ADMIN_ES)
    protected ExecutorService paExecutor;

    @Inject
    @Named(CockpitApplication.JDBC_ES)
    protected ExecutorService sqlExecutor;

    @Inject
    protected BusesDAO buses;

    @Inject
    protected WorkspacesDAO workspaces;

    @Inject
    protected CockpitActors as;

    /**
     * This is needed because the java compiler has trouble typechecking lambda on {@link CheckedCallable}.
     */
    protected <T> T runDAO(Supplier<T> s) throws SuspendExecution, InterruptedException {
        return FiberAsync.runBlocking(sqlExecutor, new CheckedCallable<T, RuntimeException>() {
            @Override
            public T call() {
                return s.get();
            }
        });
    }

    protected Domain getTopology(String ip, int port, String username, String password,
            Option<Tuple2<String, Boolean>> extra)
            throws ContainerAdministrationException, SuspendExecution, InterruptedException {
        return FiberAsync.runBlocking(paExecutor, new CheckedCallable<Domain, ContainerAdministrationException>() {
            @Override
            public Domain call() throws ContainerAdministrationException {
                return getTopology0(ip, port, username, password, extra);
            }
        });
    }

    /**
     * This is meant to be run inside the thread executor with fiber async because it is blocking.
     */
    private Domain getTopology0(String ip, int port, String username, String password,
            Option<Tuple2<String, Boolean>> extra) throws ContainerAdministrationException {

        final PetalsAdministration petals;
        try {
            petals = PetalsAdministrationFactory.getInstance().newPetalsAdministrationAPI();
        } catch (DuplicatedServiceException | MissingServiceException e) {
            throw new AssertionError(e);
        }

        try {
            petals.connect(ip, port, username, password);

            final ContainerAdministration container = petals.newContainerAdministration();

            String passphrase = extra.map(Tuple2::_1).getOrElse("");
            boolean artifacts = extra.map(Tuple2::_2).getOrElse(false);

            return container.getTopology(passphrase, artifacts);
        } finally {
            try {
                if (petals.isConnected()) {
                    petals.disconnect();
                }
            } catch (ContainerAdministrationException e) {
                LOG.warn("Error while disconnecting from container", e);
            }
        }
    }
}
