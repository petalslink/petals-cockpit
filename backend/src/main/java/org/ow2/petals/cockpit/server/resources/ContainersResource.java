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
package org.ow2.petals.cockpit.server.resources;

import java.util.Map;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;

import org.hibernate.validator.constraints.NotEmpty;
import org.ow2.petals.admin.api.artifact.ArtifactState;
import org.ow2.petals.admin.api.artifact.Component;
import org.ow2.petals.cockpit.server.actors.BusActor.GetContainerOverview;
import org.ow2.petals.cockpit.server.actors.CockpitActors;
import org.ow2.petals.cockpit.server.actors.ContainerActor.GetComponentOverview;
import org.ow2.petals.cockpit.server.actors.ContainerActor.GetServiceUnitOverview;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;

@Singleton
public class ContainersResource {

    @Path("/{cId}")
    public Class<ContainerResource> containerResource() {
        return ContainerResource.class;
    }

    public static class ContainerResource {

        private final CockpitActors as;

        @Inject
        public ContainerResource(CockpitActors as) {
            this.as = as;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        @Valid
        public ContainerOverview get(@PathParam("wsId") @Min(1) long wsId, @PathParam("bId") @Min(1) long bId,
                @PathParam("cId") @Min(1) long cId, @Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new GetContainerOverview(profile.getUser().getUsername(), bId, cId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }

        @GET
        @Path("/components/{compId}")
        @Produces(MediaType.APPLICATION_JSON)
        public ComponentOverview getComp(@PathParam("wsId") @Min(1) long wsId, @PathParam("bId") @Min(1) long bId,
                @PathParam("cId") @Min(1) long cId, @PathParam("compId") @Min(1) long compId,
                @Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new GetComponentOverview(profile.getUser().getUsername(), bId, cId, compId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }

        @GET
        @Path("/components/{compId}/serviceunits/{suId}")
        @Produces(MediaType.APPLICATION_JSON)
        public ServiceUnitOverview getSU(@PathParam("wsId") @Min(1) long wsId, @PathParam("bId") @Min(1) long bId,
                @PathParam("cId") @Min(1) long cId, @PathParam("compId") @Min(1) long compId,
                @PathParam("suId") @Min(1) long suId, @Pac4JProfile CockpitProfile profile)
                throws InterruptedException {
            return as.call(wsId, new GetServiceUnitOverview(profile.getUser().getUsername(), bId, cId, compId, suId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }
    }

    public abstract static class MinContainer {

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        public MinContainer(long id, String name) {
            this.id = id;
            this.name = name;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ContainerOverview extends MinContainer {

        @NotEmpty
        @JsonProperty
        public final String ip;

        @Min(1)
        @Max(65535)
        @JsonProperty
        public final int port;

        @JsonProperty
        public final ImmutableMap<String, String> reachabilities;

        @JsonCreator
        public ContainerOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("reachabilities") Map<String, String> reachabilities) {
            super(id, name);
            this.ip = ip;
            this.port = port;
            this.reachabilities = ImmutableMap.copyOf(reachabilities);
        }
    }

    public abstract static class MinComponent {

        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED:
                        return Loaded;
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        public enum Type {
            BC, SE;

            public static Type from(Component.ComponentType type) {
                switch (type) {
                    case BC:
                        return BC;
                    case SE:
                        return SE;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final State state;

        @NotNull
        @JsonProperty
        public final Type type;

        public MinComponent(long id, String name, State state, Type type) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.type = type;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ComponentOverview extends MinComponent {

        @JsonCreator
        public ComponentOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("type") Type type) {
            super(id, name, state, type);
        }
    }

    public abstract static class MinServiceUnit {
        public enum State {
            Loaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case LOADED:
                        return Loaded;
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    default:
                        throw new AssertionError();
                }
            }
        }

        @Min(1)
        public final long id;

        @NotEmpty
        @JsonProperty
        public final String name;

        @NotNull
        @JsonProperty
        public final State state;

        public MinServiceUnit(long id, String name, State state) {
            this.id = id;
            this.name = name;
            this.state = state;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ServiceUnitOverview extends MinServiceUnit {

        public ServiceUnitOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state) {
            super(id, name, state);
        }
    }
}
