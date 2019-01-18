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


import com.fasterxml.jackson.annotation.JsonTypeName;

import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;
import io.dropwizard.logging.filter.FilterFactory;

@JsonTypeName("cockpit-server-filter-test")
public class CockpitTestLogFilter implements FilterFactory<ILoggingEvent> {

    public static String token = "";

    @Override
    public Filter<ILoggingEvent> build() {
        return new Filter<ILoggingEvent>() {
            @Override
            public FilterReply decide(ILoggingEvent event) {
                if (event.getLoggerName().startsWith("org.ow2.petals.cockpit.server.CockpitApplication")
                        && event.getFormattedMessage()
                                .contains("No users are present in the database: setup your installation via"))
                {
                    String logline = event.getFormattedMessage();
                    String parsedToken = logline.substring(logline.indexOf("token=") + 6,
                            logline.indexOf("token=") + 26);
                    token = (parsedToken != null && !parsedToken.isEmpty()) ? parsedToken : "";

                }

                return FilterReply.NEUTRAL;
            }
        };
    }
}