import { GcsStorageWriter } from './GcsStorageWriter';
import { Storage } from '@google-cloud/storage';

jest.mock('@google-cloud/storage');

describe('GcsStorageWriter', () => {
  const MockStorage = Storage as unknown as jest.Mock;
  let mockBucket: jest.Mock;
  let mockFile: jest.Mock;
  let mockSave: jest.Mock;

  beforeEach(() => {
    mockSave = jest.fn();
    mockFile = jest.fn(() => ({ save: mockSave }));
    mockBucket = jest.fn(() => ({ file: mockFile }));
    MockStorage.mockImplementation(() => ({ bucket: mockBucket }));
    jest.clearAllMocks();
  });

  it('should write content to GCS bucket', async () => {
    const writer = new GcsStorageWriter('my-bucket');
    await writer.write('path/to/file.csv', 'some content');

    expect(MockStorage).toHaveBeenCalledTimes(1);
    expect(mockBucket).toHaveBeenCalledWith('my-bucket');
    expect(mockFile).toHaveBeenCalledWith('path/to/file.csv');
    expect(mockSave).toHaveBeenCalledWith('some content', { contentType: 'text/csv' });
  });
});
