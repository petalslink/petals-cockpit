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
package org.ow2.petals.cockpit.server.rules;

import javax.ws.rs.client.WebTarget;

import org.eclipse.jdt.annotation.Nullable;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.junit.rules.TestRule;
import org.junit.runner.Description;
import org.junit.runners.model.Statement;
import org.ow2.petals.admin.junit.PetalsAdministrationApi;
import org.ow2.petals.cockpit.server.CockpitApplication;
import org.ow2.petals.cockpit.server.CockpitConfiguration;
import org.zapodot.junit.db.EmbeddedDatabaseRule;
import org.zapodot.junit.db.plugin.LiquibaseInitializer;

import io.dropwizard.testing.ConfigOverride;
import io.dropwizard.testing.ResourceHelpers;
import io.dropwizard.testing.junit.DropwizardAppRule;

public class CockpitApplicationRule implements TestRule {

    public static class App extends CockpitApplication<CockpitConfiguration> {
        // only needed because of generics
    }

    public final DropwizardAppRule<CockpitConfiguration> dw;

    public final PetalsAdministrationApi petals = new PetalsAdministrationApi();

    public final EmbeddedDatabaseRule db;

    public CockpitApplicationRule(ConfigOverride... configOverrides) {
        this("application-tests.yml", configOverrides);
    }

    public CockpitApplicationRule(String config, ConfigOverride... configOverrides) {
        this.db = EmbeddedDatabaseRule.builder()
                .initializedByPlugin(LiquibaseInitializer.builder().withChangelogResource("migrations.xml").build())
                .build();
        this.dw = new DropwizardAppRule<>(App.class, ResourceHelpers.resourceFilePath(config),
                ConfigOverride.config("database.url", () -> this.db.getConnectionJdbcUrl()));
    }

    @Override
    @Nullable
    public Statement apply(@Nullable Statement base, @Nullable Description description) {
        assert base != null;
        assert description != null;

        return RulesHelper.chain(base, description, dw, RulesHelper.dropDbAfter(db), db, petals,
                RulesHelper.jerseyCookies(), RulesHelper.quasar());
    }

    public WebTarget target(String url) {
        return this.dw.client().target(String.format("http://localhost:%d/api%s", this.dw.getLocalPort(), url));
    }

    public DSLContext db() {
        return DSL.using(db.getConnectionJdbcUrl());
    }
}
