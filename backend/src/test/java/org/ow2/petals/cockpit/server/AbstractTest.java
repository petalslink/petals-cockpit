/**
 * Copyright (C) 2017-2019 Linagora
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
package org.ow2.petals.cockpit.server;

import org.junit.Rule;
import org.junit.rules.ExpectedException;
import org.ow2.petals.cockpit.server.utils.PetalsAdminExceptionMapper;
import org.slf4j.LoggerFactory;

import ch.qos.logback.classic.Level;
import io.dropwizard.logging.BootstrapLogging;

@SuppressWarnings("null")
public class AbstractTest {

    @Rule
    public ExpectedException thrown = ExpectedException.none();

    static {
        // the level parameter corresponds to the maximum level to be printed on the console
        BootstrapLogging.bootstrap(Level.ALL);

        // by default everything is set to INFO
        ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(ch.qos.logback.classic.Logger.ROOT_LOGGER_NAME))
                .setLevel(Level.INFO);
        // if needed, use this to set more specific log levels
        // log debug sql requests
        // setLevel(LoggerListener.class, Level.DEBUG);
        setLevel(PetalsAdminExceptionMapper.class, Level.DEBUG);
        setLevel("liquibase", Level.WARN);

        // TODO: look into this logger (why can't we log jersey exceptions ?)
        // setLevel("io.dropwizard", Level.DEBUG);
    }

    private static void setLevel(Class<?> logger, Level level) {
        ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(logger)).setLevel(level);
    }

    private static void setLevel(String logger, Level level) {
        ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(logger)).setLevel(level);
    }
}
