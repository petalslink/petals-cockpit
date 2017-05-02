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
package org.ow2.petals.cockpit.server;

import org.slf4j.LoggerFactory;

import ch.qos.logback.classic.Level;
import io.dropwizard.logging.BootstrapLogging;

public class AbstractTest {

    static {
        // the level parameter corresponds to the maximum level to be printed on the console
        BootstrapLogging.bootstrap(Level.ALL);

        // by default everything is set to INFO
        ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(ch.qos.logback.classic.Logger.ROOT_LOGGER_NAME))
                .setLevel(Level.INFO);
        // if needed, use this to set more specific log levels
        // ((ch.qos.logback.classic.Logger) LoggerFactory.getLogger(LoggerListener.class)).setLevel(Level.DEBUG);
    }
}
