import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
// import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { fetchArtworks } from './services/artworkService';
import type { Artwork } from './types/artwork';
import './App.css';

function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 0 });

  const [titleFilterVisible, setTitleFilterVisible] = useState(false);
  const [titleFilterValue, setTitleFilterValue] = useState('');
  const [totalToSelect, setTotalToSelect] = useState<number>(0);

  // Load page data
  const loadPage = async (page: number, rows: number) => {
    setLoading(true);
    try {
      const result = await fetchArtworks({ page: page + 1, size: rows });
      setArtworks(result.data);
      setTotalRecords(result.totalRecords);
      return result;
    } catch (err) {
      console.error(err);
      return { data: [], totalRecords: 0 };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(lazyParams.page, lazyParams.rows).then(result => {
      if (totalToSelect > 0) {
        const newSelected = new Set(selectedIds);
        const pageIds = result.data.map(a => a.id).filter(id => !newSelected.has(id));
        const remaining = totalToSelect - newSelected.size;
        pageIds.slice(0, remaining).forEach(id => newSelected.add(id));
        setSelectedIds(newSelected);

        const remainingToSelect = totalToSelect - newSelected.size;
        if (remainingToSelect > 0) {
          autoSelectFuturePages(lazyParams.page + 1, lazyParams.rows, remainingToSelect, newSelected);
        }
      }
    });
  }, [lazyParams.page, lazyParams.rows]);

  // Auto-select remaining rows from future pages
  const autoSelectFuturePages = async (startPage: number, pageSize: number, remaining: number, currentSelected: Set<number>) => {
    let page = startPage;
    let remainingToSelect = remaining;

    while (remainingToSelect > 0) {
      const result = await fetchArtworks({ page: page + 1, size: pageSize });
      if (!result.data || result.data.length === 0) break;

      const pageIds = result.data.map(a => a.id).filter(id => !currentSelected.has(id));
      const toSelect = pageIds.slice(0, remainingToSelect);
      toSelect.forEach(id => currentSelected.add(id));

      remainingToSelect -= toSelect.length;
      if (remainingToSelect <= 0) break;

      page++;
    }

    setSelectedIds(new Set(currentSelected));
  };

  // Handle page change
  const onPage = (event: { first: number; rows: number; page?: number }) => {
    setLazyParams({ ...lazyParams, first: event.first, rows: event.rows, page: event.page ?? 0 });
  };

  // Handle manual selection/deselection
  const onSelectionChange = (event: { value: Artwork[] }) => {
    const newSelected = new Set(selectedIds);

    // Add newly selected
    event.value.forEach(a => newSelected.add(a.id));

    // Remove deselected
    artworks.forEach(a => {
      if (!event.value.find(item => item.id === a.id)) newSelected.delete(a.id);
    });

    setSelectedIds(newSelected);
  };

  const getCurrentPageSelected = () => artworks.filter(a => selectedIds.has(a.id));

  // Column templates
  const titleTemplate = (row: Artwork) => <span className="font-medium">{row.title}</span>;
  const artistTemplate = (row: Artwork) => <span>{row.artist_display}</span>;
  const originTemplate = (row: Artwork) => <span>{row.place_of_origin}</span>;
  const inscriptionsTemplate = (row: Artwork) => (
    <span className="text-sm text-gray-600">
      {row.inscriptions.length > 50 ? `${row.inscriptions.substring(0, 50)}...` : row.inscriptions}
    </span>
  );
  const dateTemplate = (row: Artwork) => <span>{row.date_start || 'Unknown'} - {row.date_end || 'Unknown'}</span>;

  // Submit handler for number input
  const handleSubmitSelection = () => {
    const n = parseInt(titleFilterValue, 10);
    if (isNaN(n) || n <= 0) return;

    setTotalToSelect(n);

    const newSelected = new Set(selectedIds);
    const currentSelectedSize = newSelected.size;

    if (n > currentSelectedSize) {
      // Select more rows
      const pageIds = artworks.map(a => a.id).filter(id => !newSelected.has(id));
      pageIds.slice(0, n - currentSelectedSize).forEach(id => newSelected.add(id));

      const remaining = n - newSelected.size;
      if (remaining > 0) autoSelectFuturePages(lazyParams.page + 1, lazyParams.rows, remaining, newSelected);
    } else if (n < currentSelectedSize) {
      // Deselect extra rows
      const selectedArray = Array.from(newSelected);
      const toKeep = selectedArray.slice(0, n);
      newSelected.clear();
      toKeep.forEach(id => newSelected.add(id));
    }

    setSelectedIds(newSelected);
  };

  const titleHeaderTemplate = () => (
    <div className="title-header flex items-center gap-4 p-3 border border-gray-200 rounded-md shadow-sm bg-gray-50">
      {/* Accessible but visually-hidden title for screen readers */}
      <div className="relative">
        <div className="toggle-wrap flex items-center">
          <Button
            icon={titleFilterVisible ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
            className="p-button-text p-button-sm w-6 h-6 flex items-center justify-center"
            onClick={() => setTitleFilterVisible(!titleFilterVisible)}
            aria-label="Toggle title filter"
          />
        </div>

        {titleFilterVisible && (
          <Panel className="title-panel">
            <div className="filter-controls flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <InputText
                keyfilter="int"
                value={titleFilterValue}
                onChange={e => setTitleFilterValue(e.target.value)}
                placeholder="Enter number of rows to select"
                className="p-inputtext-sm w-full sm:w-40"
              />
              <Button label="Submit" size="small" onClick={handleSubmitSelection} />
            </div>
          </Panel>
        )}
      </div>
      <span className="sr-only">Title</span>
    </div>
  );

  
  return (
    <div className="app-container">
      <div className="table-container">
        <DataTable
          value={artworks}
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          selection={getCurrentPageSelected()}
          onSelectionChange={onSelectionChange}
          dataKey="id"
          selectionMode="multiple"
          emptyMessage="No artworks found"
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header={titleHeaderTemplate()} body={titleTemplate} />
          <Column field="place_of_origin" header="Origin" body={originTemplate} />
          <Column field="artist_display" header="Artist" body={artistTemplate} />
          <Column field="inscriptions" header="Inscriptions" body={inscriptionsTemplate} />
          <Column field="date_start" header="Date Range" body={dateTemplate} />
        </DataTable>
      </div>
    </div>
  );
}

export default App;
