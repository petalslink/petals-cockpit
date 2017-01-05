/**
 * Copyright (C) 2016-2017 Linagora
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
package org.ow2.petals.cockpit.server.mocks;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.eclipse.jdt.annotation.Nullable;
import org.glassfish.hk2.api.Factory;
import org.glassfish.hk2.api.InjectionResolver;
import org.glassfish.hk2.api.ServiceLocator;
import org.glassfish.hk2.api.TypeLiteral;
import org.glassfish.hk2.utilities.binding.AbstractBinder;
import org.glassfish.jersey.server.internal.inject.AbstractValueFactoryProvider;
import org.glassfish.jersey.server.internal.inject.MultivaluedParameterExtractorProvider;
import org.glassfish.jersey.server.internal.inject.ParamInjectionResolver;
import org.glassfish.jersey.server.model.Parameter;
import org.glassfish.jersey.server.spi.internal.ValueFactoryProvider;
import org.ow2.petals.cockpit.server.db.UsersDAO.DbUser;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.core.profile.CommonProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

public class MockProfileParamValueFactoryProvider extends AbstractValueFactoryProvider {

    public static final DbUser ADMIN = new DbUser(MockAuthenticator.ADMIN.username, "...",
            MockAuthenticator.ADMIN.name);

    @Inject
    public MockProfileParamValueFactoryProvider(MultivaluedParameterExtractorProvider mpep, ServiceLocator locator) {
        super(mpep, locator, Parameter.Source.UNKNOWN);
    }

    @Override
    @Nullable
    protected Factory<?> createValueFactory(@Nullable Parameter parameter) {
        assert parameter != null;
        if (CommonProfile.class.isAssignableFrom(parameter.getRawType())
                && parameter.isAnnotationPresent(Pac4JProfile.class)) {
            return new Factory<CommonProfile>() {
                @Override
                public CommonProfile provide() {
                    return new CockpitProfile(ADMIN);
                }

                @Override
                public void dispose(CommonProfile instance) {
                    // nothing
                }
            };
        }
        return null;
    }

    public static class MockProfileParamInjectionResolver extends ParamInjectionResolver<Pac4JProfile> {
        public MockProfileParamInjectionResolver() {
            super(MockProfileParamValueFactoryProvider.class);
        }
    }

    public static class Binder extends AbstractBinder {
        @Override
        protected void configure() {
            bind(MockProfileParamValueFactoryProvider.class).to(ValueFactoryProvider.class).in(Singleton.class);
            bind(MockProfileParamInjectionResolver.class).to(new TypeLiteral<InjectionResolver<Pac4JProfile>>() {
            }).in(Singleton.class);
        }
    }

}