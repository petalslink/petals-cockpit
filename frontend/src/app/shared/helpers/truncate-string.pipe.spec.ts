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

import { TruncateStringPipe } from './truncate-string.pipe';

describe('Tree helper', () => {
  let pipe: TruncateStringPipe;

  describe('truncateString', () => {
    beforeEach(() => {
      pipe = new TruncateStringPipe();
    });

    it('transforms a string of characters with "..."', () => {
      const item =
        'http://namespace-example.fr/service/technique/version/ged-sharepoint/1.1';

      const expectedItem =
        'http://namespace-example.fr/s...e/version/ged-sharepoint/1.1';

      expect(pipe.transform(item, 60, '...')).toEqual(expectedItem);
    });

    it('does not transforms a string of characters', () => {
      const itemEqualToThreshold =
        'http://namespace-example.fr/service/technique/version/1.1';

      expect(pipe.transform(itemEqualToThreshold, 60, '...')).toEqual(
        itemEqualToThreshold
      );

      const itemShorterThanThreshold =
        'http://namespace-example.fr/service/technique/ged-sharepoint';

      expect(pipe.transform(itemShorterThanThreshold, 60, '...')).toEqual(
        itemShorterThanThreshold
      );
    });
  });
});
