import { SearchService } from '../services/searchServices';
import { createClient } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({ createClient: jest.fn() }));

const mockedCreateClient = createClient as jest.Mock;

describe('SearchService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('maps rpc results correctly', async () => {
    const rpcMock = jest.fn().mockResolvedValue({
      data: [{ id: '1', name: 'r', total_count: 1 }],
      error: null
    });
    mockedCreateClient.mockReturnValue({ rpc: rpcMock });

    const result = await SearchService.advancedSearch({ search: 'r', page: 1, limit: 5 });
    expect(rpcMock).toHaveBeenCalled();
    expect(result.data[0].id).toBe('1');
    expect(result.total_count).toBe(1);
    expect(result.has_more).toBe(false);
  });

  it('throws when rpc returns error', async () => {
    const rpcMock = jest.fn().mockResolvedValue({ data: null, error: new Error('fail') });
    mockedCreateClient.mockReturnValue({ rpc: rpcMock });

    await expect(SearchService.advancedSearch({})).rejects.toEqual(new Error('fail'));
  });
});
