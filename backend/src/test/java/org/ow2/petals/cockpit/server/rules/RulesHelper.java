/**
 * Copyright (C) 2017-2018 Linagora
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
package org.ow2.petals.cockpit.server.rules;

import java.net.CookieHandler;
import java.net.CookieManager;

import org.jooq.impl.DSL;
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.zapodot.junit.db.EmbeddedDatabaseRule;

public class RulesHelper {

    private RulesHelper() {
        // utility class
    }

    public static Statement chain(Statement base, Description description, TestRule... rules) {
        Statement b = base;
        for (TestRule rule : rules) {
            b = rule.apply(b, description);
            assert b != null;
        }
        return b;
    }

    public static TestRule before(Runnable r) {
        return around(r, () -> {
        });
    }

    public static TestRule after(Runnable r) {
        return around(() -> {
        }, r);
    }

    public static TestRule around(Runnable before, Runnable after) {
        return (base, description) -> {
            return new Statement() {
                @Override
                public void evaluate() throws Throwable {
                    before.run();
                    try {
                        base.evaluate();
                    } finally {
                        after.run();
                    }
                }
            };
        };
    }

    public static TestRule dropDbAfter(EmbeddedDatabaseRule db) {
        return after(() -> DSL.using(db.getConnectionJdbcUrl()).execute("DROP ALL OBJECTS"));
    }

    public static TestRule jerseyCookies() {
        return around(() -> CookieHandler.setDefault(new CookieManager()), () -> CookieHandler.setDefault(null));
    }
}
