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

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
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
import org.ow2.petals.cockpit.server.actors.ContainerActor.ChangeServiceUnitState;
import org.ow2.petals.cockpit.server.actors.ContainerActor.GetComponentOverview;
import org.ow2.petals.cockpit.server.actors.ContainerActor.GetServiceUnitOverview;
import org.ow2.petals.cockpit.server.security.CockpitProfile;
import org.pac4j.jax.rs.annotations.Pac4JProfile;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;

public class ContainerResource {

    private final long wsId;

    private final long bId;

    private final long cId;

    private final CockpitActors as;

    public ContainerResource(CockpitActors as, long wsId, long bId, long cId) {
        this.as = as;
        this.wsId = wsId;
        this.bId = bId;
        this.cId = cId;
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Valid
    public ContainerOverview get(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
        return as.call(wsId, new GetContainerOverview(profile.getUser().getUsername(), bId, cId))
                .getOrElseThrow(s -> new WebApplicationException(s));
    }

    @Path("/components/{compId}")
    public ComponentResource component(@PathParam("compId") @Min(1) long compId) {
        return new ComponentResource(as, wsId, bId, cId, compId);
    }

    public static class ComponentResource {

        private final long wsId;

        private final long bId;

        private final long cId;

        private final long compId;

        private final CockpitActors as;

        public ComponentResource(CockpitActors as, long wsId, long bId, long cId, long compId) {
            this.as = as;
            this.wsId = wsId;
            this.bId = bId;
            this.cId = cId;
            this.compId = compId;
        }

        @Path("/serviceunits/{suId}")
        public SUResource su(@PathParam("suId") @Min(1) long suId) {
            return new SUResource(as, wsId, bId, cId, compId, suId);
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public ComponentOverview getComp(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new GetComponentOverview(profile.getUser().getUsername(), bId, cId, compId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }
    }

    public static class SUResource {

        private final long wsId;

        private final long bId;

        private final long cId;

        private final long compId;

        private final long suId;

        private final CockpitActors as;

        public SUResource(CockpitActors as, long wsId, long bId, long cId, long compId, long suId) {
            this.as = as;
            this.wsId = wsId;
            this.bId = bId;
            this.cId = cId;
            this.compId = compId;
            this.suId = suId;
        }

        @GET
        @Produces(MediaType.APPLICATION_JSON)
        public ServiceUnitOverview getSU(@Pac4JProfile CockpitProfile profile) throws InterruptedException {
            return as.call(wsId, new GetServiceUnitOverview(profile.getUser().getUsername(), bId, cId, compId, suId))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }

        @PUT
        @Consumes(MediaType.APPLICATION_JSON)
        @Produces(MediaType.APPLICATION_JSON)
        public ServiceUnitOverview changeSUState(@Pac4JProfile CockpitProfile profile, @Valid ChangeState action)
                throws InterruptedException {
            return as.call(wsId,
                    new ChangeServiceUnitState(profile.getUser().getUsername(), bId, cId, compId, suId, action.state))
                    .getOrElseThrow(s -> new WebApplicationException(s));
        }
    }

    public static class ChangeState {

        @NotNull
        @JsonProperty
        public final MinServiceUnit.State state;

        public ChangeState(@JsonProperty("state") MinServiceUnit.State state) {
            this.state = state;
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

        @NotNull
        @JsonProperty
        public final String systemInfo;

        @JsonCreator
        public ContainerOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("ip") String ip, @JsonProperty("port") int port,
                @JsonProperty("reachabilities") Map<String, String> reachabilities,
                @JsonProperty("systemInfo") String systemInfo) {
            super(id, name);
            this.ip = ip;
            this.port = port;
            this.reachabilities = ImmutableMap.copyOf(reachabilities);
            this.systemInfo = systemInfo;
        }
    }

    public abstract static class MinComponent {

        public enum State {
            NotLoaded, Loaded, Shutdown, Stopped, Started, Unknown;

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
                        throw new AssertionError("impossible");
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
            NotLoaded, Started, Stopped, Shutdown, Unknown;

            public static State from(ArtifactState.State state) {
                switch (state) {
                    case STARTED:
                        return Started;
                    case STOPPED:
                        return Stopped;
                    case SHUTDOWN:
                        return Shutdown;
                    case UNKNOWN:
                        return Unknown;
                    case LOADED:
                        throw new AssertionError("Loaded state does not exist for SA/SU");
                    default:
                        throw new AssertionError("impossible");
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
        public final String saName;

        public MinServiceUnit(long id, String name, State state, String saName) {
            this.id = id;
            this.name = name;
            this.state = state;
            this.saName = saName;
        }

        @JsonProperty
        public String getId() {
            return Long.toString(id);
        }
    }

    public static class ServiceUnitOverview extends MinServiceUnit {

        public ServiceUnitOverview(@JsonProperty("id") long id, @JsonProperty("name") String name,
                @JsonProperty("state") State state, @JsonProperty("saName") String saName) {
            super(id, name, state, saName);
        }
    }
}
