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
package org.ow2.petals.cockpit.server.commands;

import org.eclipse.jdt.annotation.Nullable;
import org.mindrot.jbcrypt.BCrypt;
import org.ow2.petals.cockpit.server.configuration.CockpitConfiguration;

import com.allanbank.mongodb.MongoClient;
import com.allanbank.mongodb.MongoCollection;
import com.allanbank.mongodb.MongoDatabase;
import com.allanbank.mongodb.bson.Document;
import com.allanbank.mongodb.bson.builder.BuilderFactory;
import com.allanbank.mongodb.bson.builder.DocumentBuilder;
import com.allanbank.mongodb.builder.QueryBuilder;

import io.dropwizard.cli.ConfiguredCommand;
import io.dropwizard.setup.Bootstrap;
import net.sourceforge.argparse4j.inf.Namespace;
import net.sourceforge.argparse4j.inf.Subparser;

/**
 * This commands creates a Demo workspace in the database
 * 
 * @author vnoel
 *
 */
public class AddUserCommand extends ConfiguredCommand<CockpitConfiguration> {

    public AddUserCommand() {
        super("add-user", "Add a user to the database");
    }

    @Override
    public void configure(@Nullable Subparser subparser) {
        super.configure(subparser);
        assert subparser != null;

        subparser.addArgument("-u", "--username").dest("username").required(true);
        subparser.addArgument("-n", "--name").dest("name").required(true);
        subparser.addArgument("-p", "--password").dest("password").required(true);
    }

    @Override
    protected void run(@Nullable Bootstrap<CockpitConfiguration> bootstrap, @Nullable Namespace namespace,
            CockpitConfiguration configuration) throws Exception {
        assert namespace != null;
        try (final MongoClient client = configuration.getDatabaseFactory().buildClient(null)) {
            final MongoDatabase db = client.getDatabase(configuration.getDatabaseFactory().getDatabase());

            addUser(db, namespace);
        }
    }

    private void addUser(MongoDatabase db, Namespace namespace) {
        final String username = namespace.getString("username");
        final MongoCollection users = db.getCollection("users");
        final Document user = users.findOne(QueryBuilder.where("username").equals(username));
        if (user == null) {
            final DocumentBuilder builder = BuilderFactory.start();
            builder.add("username", username);
            builder.add("password", BCrypt.hashpw(namespace.getString("password"), BCrypt.gensalt()));
            builder.add("display_name", namespace.getString("name"));
            users.insert(builder.build());
            System.out.println("Added user " + username);
        } else {
            throw new IllegalArgumentException("User " + username + " already exists");
        }
    }
}
