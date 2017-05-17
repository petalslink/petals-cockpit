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
package org.ow2.petals.cockpit.server.resources;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.db.api.Assertions.assertThat;
import static org.ow2.petals.cockpit.server.db.generated.Tables.USERS;
import static org.ow2.petals.cockpit.server.db.generated.Tables.WORKSPACES;

import java.util.Map;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.sse.EventInput;
import org.glassfish.jersey.media.sse.SseFeature;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.BusesResource.BusFull;
import org.ow2.petals.cockpit.server.resources.ComponentsResource.ComponentFull;
import org.ow2.petals.cockpit.server.resources.ContainersResource.ContainerFull;
import org.ow2.petals.cockpit.server.resources.ServiceAssembliesResource.ServiceAssemblyFull;
import org.ow2.petals.cockpit.server.resources.ServiceUnitsResource.ServiceUnitFull;
import org.ow2.petals.cockpit.server.resources.UserSession.UserMin;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceDeleted;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceFullContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverview;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceOverviewContent;
import org.ow2.petals.cockpit.server.resources.WorkspaceResource.WorkspaceUpdate;

public class WorkspaceResourceTest extends AbstractDefaultWorkspaceResourceTest {

    public WorkspaceResourceTest() {
        super(WorkspaceResource.class);
    }

    @Test
    public void deleteWorkspaceNonExistingWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/3").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);
    }

    @Test
    public void deleteWorkspaceWorkspaceForbidden() {
        Response delete = resource.target("/workspaces/2").request().delete();

        assertThat(delete.getStatus()).isEqualTo(403);

        // it wasn't deleted
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);
    }

    @Test
    public void deleteWorkspace() {
        assertThat(table(WORKSPACES)).hasNumberOfRows(2);

        WorkspaceDeleted delete = resource.target("/workspaces/1").request().delete(WorkspaceDeleted.class);

        assertThat(delete.id).isEqualTo(1);

        // only the second workspace is still present
        assertThat(table(WORKSPACES)).hasNumberOfRows(1);

        assertThat(requestWorkspace(1)).hasNumberOfRows(0);
        assertThat(requestWorkspace(2)).hasNumberOfRows(1);

        assertThat(requestBus(getId(domain))).hasNumberOfRows(0);
        assertThat(requestBus(getId(fDomain))).hasNumberOfRows(1);

        assertThat(requestContainer(getId(container1))).hasNumberOfRows(0);
        assertThat(requestContainer(getId(container2))).hasNumberOfRows(0);
        assertThat(requestContainer(getId(container3))).hasNumberOfRows(0);
        assertThat(requestContainer(getId(fContainer))).hasNumberOfRows(1);

        assertThat(requestComponent(getId(component))).hasNumberOfRows(0);
        assertThat(requestComponent(getId(fComponent))).hasNumberOfRows(1);

        assertThat(requestSA(getId(serviceAssembly))).hasNumberOfRows(0);
        assertThat(requestSA(getId(fServiceAssembly))).hasNumberOfRows(1);

        assertThat(requestSU(getId(serviceUnit))).hasNumberOfRows(0);
        assertThat(requestSU(getId(fServiceUnit))).hasNumberOfRows(1);
    }

    @Test
    public void getEventNonExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/3/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getEventWorkspaceForbidden() {
        Response get = resource.target("/workspaces/2/content").request(SseFeature.SERVER_SENT_EVENTS_TYPE).get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    @Test
    public void getExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        WorkspaceFullContent content = resource.target("/workspaces/1/content").request()
                .get(WorkspaceFullContent.class);

        assertContent(content);

        // with a normal GET, we don't record it as the last workspace of the user
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();
    }

    @Test
    public void getEventExistingWorkspace() {
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isNull();

        try (EventInput eventInput = resource.sse(1)) {
            expectWorkspaceContent(eventInput, (t, a) -> assertContent(t));
        }

        // ensure that calling get workspace tree set the last workspace in the db
        assertThat(table(USERS)).row(0).value(USERS.LAST_WORKSPACE.getName()).isEqualTo(1);
    }

    public void getOverviewNonExistingWorkspaceForbidden() {
        Response get = resource.target("/workspaces/3").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspaceForbidden() {
        Response get = resource.target("/workspaces/2").request().get();

        assertThat(get.getStatus()).isEqualTo(403);
    }

    public void getOverviewWorkspace() {
        WorkspaceOverviewContent get = resource.target("/workspaces/1").request().get(WorkspaceOverviewContent.class);

        assertOverview(get.workspace);

        assertUsers(get.users);
    }

    public void setDescriptionNonExistingWorkspaceForbidden() {
        Response put = resource.target("/workspaces/3").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);
    }

    public void setDescriptionWorkspaceForbidden() {
        Response put = resource.target("/workspaces/2").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")));

        assertThat(put.getStatus()).isEqualTo(403);

        // it wasn't changed!
        assertThat(requestWorkspace(2)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");
    }

    public void setDescription() {
        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("");

        WorkspaceOverviewContent put = resource.target("/workspaces/1").request()
                .put(Entity.json(new WorkspaceUpdate(null, "description")), WorkspaceOverviewContent.class);
        
        assertThat(put.workspace.id).isEqualTo(1);
        assertThat(put.workspace.name).isEqualTo("test");
        assertThat(put.workspace.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(put.workspace.description).isEqualTo("description");

        assertUsers(put.users);

        assertThat(requestWorkspace(1)).row(0).value(WORKSPACES.DESCRIPTION.getName()).isEqualTo("description");
    }

    private void assertUsers(Map<String, UserMin> users) {
        assertThat(users).hasSize(1);

        UserMin u = users.values().iterator().next();
        assert u != null;

        assertThat(u.id).isEqualTo(ADMIN);
        assertThat(u.name).isEqualTo("Administrator");
    }

    private void assertOverview(WorkspaceOverview overview) {
        assertThat(overview.id).isEqualTo(1);
        assertThat(overview.name).isEqualTo("test");
        assertThat(overview.users).containsExactlyInAnyOrder(ADMIN);
        assertThat(overview.description).isEqualTo("");
    }

    private void assertContent(WorkspaceFullContent content) {
        assertOverview(content.workspace);

        assertThat(content.content.buses).hasSize(1);
        assertThat(content.content.containers).hasSize(3);
        assertThat(content.content.components).hasSize(1);
        assertThat(content.content.serviceAssemblies).hasSize(1);
        assertThat(content.content.serviceUnits).hasSize(1);

        assertUsers(content.users);

        BusFull b = content.content.buses.get(Long.toString(getId(domain)));
        assert b != null;

        assertThat(b.bus.id).isEqualTo(getId(domain));
        assertThat(b.bus.name).isEqualTo(domain.getName());
        assertThat(b.workspaceId).isEqualTo(content.workspace.id);
        assertThat(b.containers).containsOnly(Long.toString(getId(container1)), Long.toString(getId(container2)),
                Long.toString(getId(container3)));

        ContainerFull c1 = content.content.containers.get(Long.toString(getId(container1)));
        assert c1 != null;

        assertThat(c1.container.id).isEqualTo(getId(container1));
        assertThat(c1.container.name).isEqualTo(container1.getContainerName());
        assertThat(c1.busId).isEqualTo(b.bus.id);
        assertThat(c1.components).containsOnly(Long.toString(getId(component)));
        assertThat(c1.serviceAssemblies).containsOnly(Long.toString(getId(serviceAssembly)));

        ContainerFull c2 = content.content.containers.get(Long.toString(getId(container2)));
        assert c2 != null;

        assertThat(c2.container.id).isEqualTo(getId(container2));
        assertThat(c2.container.name).isEqualTo(container2.getContainerName());
        assertThat(c2.busId).isEqualTo(b.bus.id);
        assertThat(c2.components).containsOnly();
        assertThat(c2.serviceAssemblies).containsOnly();

        ContainerFull c3 = content.content.containers.get(Long.toString(getId(container3)));
        assert c3 != null;

        assertThat(c3.container.id).isEqualTo(getId(container3));
        assertThat(c3.container.name).isEqualTo(container3.getContainerName());
        assertThat(c3.busId).isEqualTo(b.bus.id);
        assertThat(c3.components).containsOnly();
        assertThat(c3.serviceAssemblies).containsOnly();

        ComponentFull comp = content.content.components.get(Long.toString(getId(component)));
        assert comp != null;

        assertThat(comp.component.id).isEqualTo(getId(component));
        assertThat(comp.component.name).isEqualTo(component.getName());
        assertThat(comp.containerId).isEqualTo(c1.container.id);
        assertThat(comp.state.toString()).isEqualTo(component.getState().toString());
        assertThat(comp.serviceUnits).containsOnly(Long.toString(getId(serviceUnit)));

        ServiceAssemblyFull sa = content.content.serviceAssemblies.get(Long.toString(getId(serviceAssembly)));
        assert sa != null;

        assertThat(sa.serviceAssembly.id).isEqualTo(getId(serviceAssembly));
        assertThat(sa.serviceAssembly.name).isEqualTo(serviceAssembly.getName());
        assertThat(sa.containerId).isEqualTo(c1.container.id);
        assertThat(sa.state.toString()).isEqualTo(serviceAssembly.getState().toString());
        assertThat(sa.serviceUnits).containsOnly(Long.toString(getId(serviceUnit)));

        ServiceUnitFull su = content.content.serviceUnits.get(Long.toString(getId(serviceUnit)));
        assert su != null;

        assertThat(su.serviceUnit.id).isEqualTo(getId(serviceUnit));
        assertThat(su.serviceUnit.name).isEqualTo(serviceUnit.getName());
        assertThat(su.containerId).isEqualTo(c1.container.id);
        assertThat(su.componentId).isEqualTo(comp.component.id);
        assertThat(su.serviceAssemblyId).isEqualTo(sa.serviceAssembly.id);
    }
}
