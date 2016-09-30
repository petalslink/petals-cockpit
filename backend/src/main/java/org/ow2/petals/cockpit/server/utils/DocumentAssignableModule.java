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
package org.ow2.petals.cockpit.server.utils;

import java.io.IOException;

import org.eclipse.jdt.annotation.NonNull;
import org.eclipse.jdt.annotation.Nullable;

import com.allanbank.mongodb.bson.DocumentAssignable;
import com.allanbank.mongodb.bson.json.Json;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

public class DocumentAssignableModule extends SimpleModule {

    private static final long serialVersionUID = -7688163839940614651L;

    public DocumentAssignableModule() {
        addSerializer(DocumentAssignable.class, new DocumentAssignableSerializer());
        addDeserializer(DocumentAssignable.class, new DocumentAssignableDeserializer());
    }
}

class DocumentAssignableDeserializer extends StdDeserializer<DocumentAssignable> {

    private static final long serialVersionUID = -3793512274350222890L;

    public DocumentAssignableDeserializer() {
        super(DocumentAssignable.class);
    }

    @Override
    public @NonNull DocumentAssignable deserialize(@Nullable JsonParser p, @Nullable DeserializationContext ctxt)
            throws IOException {
        assert p != null;
        assert ctxt != null;

        return Json.parse(p.readValueAsTree().toString());
    }
}

class DocumentAssignableSerializer extends StdSerializer<DocumentAssignable> {

    private static final long serialVersionUID = 6274585714855435189L;

    public DocumentAssignableSerializer() {
        super(DocumentAssignable.class);
    }

    @Override
    public void serialize(DocumentAssignable value, @Nullable JsonGenerator gen, @Nullable SerializerProvider provider)
            throws IOException {
        assert gen != null;
        assert provider != null;

        gen.writeRawValue(StrictJson.serialize(value));
    }
}
