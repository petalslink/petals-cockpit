/**
 * Copyright (C) 2017-2020 Linagora
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

import java.util.List;

import javax.ws.rs.client.Entity;
import javax.ws.rs.core.GenericType;
import javax.ws.rs.core.Response;

import org.junit.Before;
import org.junit.Test;
import org.ow2.petals.cockpit.server.resources.UsersResource.NewUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.UpdateUser;
import org.ow2.petals.cockpit.server.resources.UsersResource.UserMin;

public class UsersResourceTest extends AbstractCockpitResourceTest {

    public UsersResourceTest() {
        super(UsersResource.class);
    }

    @Before
    public void setup() {
        addUser("user1");
        addUser("user2");
        addUser("user3");
        addUser("admin", true);
    }

    @Test
    public void listAll() {
        List<UserMin> users = resource.target("/users").request().get(new GenericType<List<UserMin>>() {
        });

        assertThat(users.stream().map(u -> u.id)).containsExactlyInAnyOrder("user1", "user2", "user3", "admin");

        assertThatDbUser("user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");
        assertThatDbUser("admin");
    }

    @Test
    public void getOne() {
        UserMin user = resource.target("/users/user1").request().get(UserMin.class);

        assertThat(user.id).isEqualTo("user1");
        assertThat(user.name).isEqualTo("user1");

        assertThatDbUser("user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");
    }

    @Test
    public void deleteUser() {
        Response delete = resource.target("/users/user1").request().delete();
        assertThat(delete.getStatus()).isEqualTo(204); // Success: No content

        assertNoDbUser("user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");
    }

    @Test
    public void deleteUser404() {
        Response delete = resource.target("/users/user4").request().delete();
        assertThat(delete.getStatus()).isEqualTo(404); // Success: No content

        assertThatDbUser("user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");
    }

    @Test
    public void addUser() {
        String username = "user4";
        String password = "userPw";
        String name = "User Name";

        Response post = resource.target("/users").request().post(Entity.json(new NewUser(username, password, name, false)));
        assertThat(post.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser("user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");

        assertThatDbUser(username).value("name").isEqualTo(name);
        assertThatDbUserPassword(username, password);
    }

    @Test
    public void addUserDifferentCaseUsername() { 
        String username = "gregoire";
        String password = "pw";
        String name = "name";

        Response post = resource.target("/users").request().post(Entity.json(new NewUser(username, password, name, false)));
        assertThat(post.getStatus()).isEqualTo(204); // Success: No content
        assertThatDbUser(username);

        String diffCaseUsername = "GreGoIRe";

        Response newPost = resource.target("/users").request().post(Entity.json(new NewUser(diffCaseUsername, password, name, false)));
        assertThat(newPost.getStatus()).isEqualTo(409); // Conflict
        assertNoDbUser(diffCaseUsername);
    }

    @Test
    public void addUserSeparatedUsername() {
        String password = "pw";
        String name = "name";

        String dashUsername = "alex-lagane";
        Response postDashUsername = resource.target("/users").request().post(Entity.json(new NewUser(dashUsername, password, name, false)));
        assertThat(postDashUsername.getStatus()).isEqualTo(204); // Success: No content
        assertThatDbUser(dashUsername);

        String dotUsername = "bertrand.escudie";
        Response postDotUsername = resource.target("/users").request().post(Entity.json(new NewUser(dotUsername, password, name, false)));
        assertThat(postDotUsername.getStatus()).isEqualTo(204); // Success: No content
        assertThatDbUser(dotUsername);

        String underscoreUsername = "pierre_souquet";
        Response postUnderscoreUsername = resource.target("/users").request().post(Entity.json(new NewUser(underscoreUsername, password, name, false)));
        assertThat(postUnderscoreUsername.getStatus()).isEqualTo(204); // Success: No content
        assertThatDbUser(underscoreUsername);
    }

    @Test
    public void addUserNullName() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("nameless", "pw", null, false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("nameless");
    }

    @Test
    public void addUserVoidName() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("nameless", "pw", "", false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("nameless");
    }

    @Test
    public void addUserNullPassword() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("passless", null, "named", false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("passless");
    }

    @Test
    public void addUserVoidPassword() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("passless", "", "named", false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("passless");
    }

    @Test
    public void addUserVoidNameAndPassword() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("nullUser", "", "", false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("nullUser");
    }

    @Test
    public void addUserNullNameAndPassword() {
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("nullUser", null, null, false)));
        assertThat(post.getStatus()).isEqualTo(422); // Unprocessable Entity
        assertNoDbUser("nullUser");
    }

    @Test
    public void addUserConflict() {
        String name = "User Name";
        Response post = resource.target("/users").request().post(Entity.json(new NewUser("user1", "pw", name, false)));
        assertThat(post.getStatus()).isEqualTo(409); // Conflict

        assertThatDbUser("user1").value("name").isEqualTo("user1");
        assertThatDbUserPassword("user1", "user1");
        assertThatDbUser("user2");
        assertThatDbUser("user3");
    }

    @Test
    public void addUserSpecialCharactersUsername() { 
        // user with spaced username
        String spacedUsername = "Pierre Souquet";
        Response postSpacedUsername = resource.target("/users").request().post(Entity.json(new NewUser(spacedUsername, "pw", "psouquet", false)));
        assertThat(postSpacedUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(spacedUsername);

        // user with special characters username
        String specialCharUsername = "Tôp$î^@éé";
        Response postSpecialCharUsername = resource.target("/users").request().post(Entity.json(new NewUser(specialCharUsername, "pw", "cchevalier", false)));
        assertThat(postSpecialCharUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(specialCharUsername);

        // username starts with special characters
        String startWithDotUsername = ".pierre";
        Response postStartWithDotUsername = resource.target("/users").request().post(Entity.json(new NewUser(startWithDotUsername, "pw", "cchevalier", false)));
        assertThat(postStartWithDotUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(startWithDotUsername);
 
        String startWithDashUsername = "-pierre";
        Response postStartWithDashUsername = resource.target("/users").request().post(Entity.json(new NewUser(startWithDashUsername, "pw", "cchevalier", false)));
        assertThat(postStartWithDashUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(startWithDashUsername);
        
        String startWithUnderscoreUsername = "_pierre";
        Response postStartWithUnderscoreUsername = resource.target("/users").request().post(Entity.json(new NewUser(startWithUnderscoreUsername, "pw", "cchevalier", false)));
        assertThat(postStartWithUnderscoreUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(startWithUnderscoreUsername);

        //user with one dot username
        String oneDotUsername = ".";
        Response postOneDotUsername = resource.target("/users").request().post(Entity.json(new NewUser(oneDotUsername, "pw", "point", false)));
        assertThat(postOneDotUsername.getStatus()).isEqualTo(422); // Unprocessable entity: username must be valid.
        assertNoDbUser(oneDotUsername);
    }

    @Test
    public void emptyChangeUser() {
        Response put = resource.target("/users/user1").request().put(Entity.json(new UpdateUser(null, null, null)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content
    }

    @Test
    public void renameUser() {
        String newName = "New User Name";

        Response put = resource.target("/users/user1").request().put(Entity.json(new UpdateUser(null, newName, null)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser("user1").value("name").isEqualTo(newName);
    }

    @Test
    public void changePasswordUser() {
        String newPassword = "New Password";

        Response put = resource.target("/users/user1").request()
                .put(Entity.json(new UpdateUser(newPassword, null, null)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUserPassword("user1", newPassword);
    }

    @Test
    public void changeNameAndPassword() {
        String newName = "New User Name";
        String newPassword = "New Password";

        Response put = resource.target("/users/user1").request()
                .put(Entity.json(new UpdateUser(newPassword, newName, null)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser("user1").value("name").isEqualTo(newName);
        assertThatDbUserPassword("user1", newPassword);
    }

    @Test
    public void getAdmin() {
        UserMin view = resource.target("/users/admin").request().get(UserMin.class);

        assertThat(view).isNotNull();
        assertThat(view.isAdmin).isTrue();
    }

    @Test
    public void getNotAdmin() {
        UserMin view = resource.target("/users/user1/").request().get(UserMin.class);

        assertThat(view).isNotNull();
        assertThat(view.isAdmin).isFalse();
    }

    @Test
    public void setAdmin() {
        Response put = resource.target("/users/user1").request().put(Entity.json(new UpdateUser(null, null, true)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser("user1").value("admin").isEqualTo(true);
        assertThatDbUser("user2").value("admin").isEqualTo(false);
        assertThatDbUser("admin").value("admin").isEqualTo(true);
    }

    @Test
    public void setAdminAndChangeName() {
        String newName = "newName";
        Response put = resource.target("/users/user1").request().put(Entity.json(new UpdateUser(null, newName, true)));
        assertThat(put.getStatus()).isEqualTo(204); // Success: No content

        assertThatDbUser("user1").value("admin").isEqualTo(true);
        assertThatDbUser("user1").value("name").isEqualTo(newName);
        assertThatDbUser("user2").value("admin").isEqualTo(false);
        assertThatDbUser("admin").value("admin").isEqualTo(true);
    }

    @Test
    public void lastAdminCanNotBeDemoted() {
        Response put = resource.target("/users/admin").request().put(Entity.json(new UpdateUser(null, null, false)));
        assertThat(put.getStatus()).isEqualTo(409); // Fail: Conflict

        assertThatDbUser("user1").value("admin").isEqualTo(false);
        assertThatDbUser("user2").value("admin").isEqualTo(false);
        assertThatDbUser("admin").value("admin").isEqualTo(true);

    }
}
