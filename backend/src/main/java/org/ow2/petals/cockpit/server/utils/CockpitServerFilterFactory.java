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
package org.ow2.petals.cockpit.server.utils;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonTypeName;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;
import io.dropwizard.logging.filter.FilterFactory;

@JsonTypeName("cockpit-server-filter-factory")
public class CockpitServerFilterFactory implements FilterFactory<ILoggingEvent> {

    private static final Logger LOG = LoggerFactory.getLogger(CockpitServerFilterFactory.class);

    @Override
    public Filter<ILoggingEvent> build() {
        return new Filter<ILoggingEvent>() {
            @Override
            public FilterReply decide(ILoggingEvent event) {
                // While waiting for this to be resolved : https://github.com/eclipse-ee4j/jersey/issues/3507
                if (event.getLoggerName().startsWith("org.glassfish.jersey.internal.Errors")
                        && event.getLevel() == Level.WARN) {

                    String newMessage = null;
                    final String message = event.getMessage();
                    if (message.contains("HTTP 404 Not Found") && message.contains("For input string: ")) {
                        final int culpritIndex = message.indexOf("For input string:");
                        newMessage = "HTTP 404 Not Found, f"
                                + message.substring(culpritIndex + 1, message.indexOf('"', culpritIndex + 19) + 1);
                    } else if (message.contains("HTTP 403 Forbidden")) {
                        newMessage = "HTTP 403 Forbidden";
                    } else if (message.contains("HTTP 401 Unauthorized")) {
                        newMessage = "HTTP 401 Unauthorized";
                    }

                    if (newMessage != null && !newMessage.isEmpty()) {
                        LOG.info("{} (event filtered from {})", newMessage, event.getLoggerName());
                        return FilterReply.DENY;
                    }
                    return FilterReply.NEUTRAL;
                }

                else if (event.getLoggerName().startsWith("org.ow2.petals.cockpit.server")) {
                    return FilterReply.DENY;

                } else {
                    return FilterReply.NEUTRAL;
                }
            }
        };
    }
}