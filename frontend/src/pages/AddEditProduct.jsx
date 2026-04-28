import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save } from 'lucide-react';
import { getProduct, createProduct, updateProduct } from '../api/productsApi';
import { getSuppliers } from '../api/suppliersApi';
import toast from 'react-hot-toast';

const CATS = ['grains','pulses','oils','spices','dairy','beverages','packaged','flour','sugar_salt','other'];
const UNITS = ['kg','grams','liters','ml','packets','pieces','bags','quintals','boxes','dozens'];
const GST = [0, 5, 12, 18, 28];

const EMPTY = {
  name:'', category:'grains', sku:'', barcode:'', unit:'kg',
  costPrice:'', sellingPrice:'', quantity:'', lowStockThreshold:10,
  expiryDate:'', batchNo:'', gstRate:5, description:'', supplier:'',
};

export default function AddEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isEdit = !!id;
  const [form, setForm] = useState(EMPTY);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getSuppliers({ limit: 100 }).then(r => setSuppliers(r.data.data)).catch(() => {});
    if (isEdit) {
      getProduct(id).then(r => {
        const p = r.data.data;
        setForm({
          name: p.name||'', category: p.category||'grains', sku: p.sku||'',
          barcode: p.barcode||'', unit: p.unit||'kg',
          costPrice: p.costPrice||'', sellingPrice: p.sellingPrice||'',
          quantity: p.quantity||'', lowStockThreshold: p.lowStockThreshold||10,
          expiryDate: p.expiryDate ? p.expiryDate.slice(0,10) : '',
          batchNo: p.batchNo||'', gstRate: p.gstRate||5,
          description: p.description||'', supplier: p.supplier?._id||p.supplier||'',
        });
      }).catch(() => toast.error('Failed to load product'));
    }
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.costPrice || Number(form.costPrice) < 0) e.costPrice = 'Valid cost price required';
    if (!form.sellingPrice || Number(form.sellingPrice) < 0) e.sellingPrice = 'Valid selling price required';
    if (!isEdit && (form.quantity === '' || Number(form.quantity) < 0)) e.quantity = 'Valid quantity required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, costPrice: Number(form.costPrice), sellingPrice: Number(form.sellingPrice), quantity: Number(form.quantity), lowStockThreshold: Number(form.lowStockThreshold), gstRate: Number(form.gstRate) };
      if (!payload.expiryDate) delete payload.expiryDate;
      if (!payload.supplier) delete payload.supplier;
      if (!payload.barcode) delete payload.barcode;
      if (isEdit) { await updateProduct(id, payload); toast.success('Product updated!'); }
      else { await createProduct(payload); toast.success('Product created!'); }
      navigate('/products');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => navigate('/products')}><ArrowLeft size={18}/></button>
          <div>
            <h2>{isEdit ? t('products.editProduct') : t('products.addProduct')}</h2>
            <p style={{ color: 'var(--text-muted)' }}>{isEdit ? 'Update product details' : 'Add a new product to inventory'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--teal)' }}>Basic Information</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('products.name')} *</label>
              <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Basmati Rice"/>
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.category')} *</label>
              <select className="form-select" value={form.category} onChange={e=>set('category',e.target.value)}>
                {CATS.map(c=><option key={c} value={c}>{t(`categories.${c}`)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.sku')}</label>
              <input className="form-input" value={form.sku} onChange={e=>set('sku',e.target.value)} placeholder="Auto-generated if empty"/>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.barcode')}</label>
              <input className="form-input" value={form.barcode} onChange={e=>set('barcode',e.target.value)} placeholder="Enter barcode"/>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.unit')} *</label>
              <select className="form-select" value={form.unit} onChange={e=>set('unit',e.target.value)}>
                {UNITS.map(u=><option key={u} value={u}>{t(`units.${u}`)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.gstRate')} (%)</label>
              <select className="form-select" value={form.gstRate} onChange={e=>set('gstRate',e.target.value)}>
                {GST.map(g=><option key={g} value={g}>{g}%</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">{t('products.description')}</label>
            <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Optional description"/>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--teal)' }}>Pricing & Stock</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('products.costPrice')} (₹) *</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.costPrice} onChange={e=>set('costPrice',e.target.value)}/>
              {errors.costPrice && <span className="form-error">{errors.costPrice}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.sellingPrice')} (₹) *</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.sellingPrice} onChange={e=>set('sellingPrice',e.target.value)}/>
              {errors.sellingPrice && <span className="form-error">{errors.sellingPrice}</span>}
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">{t('products.quantity')} *</label>
                <input className="form-input" type="number" min="0" value={form.quantity} onChange={e=>set('quantity',e.target.value)}/>
                {errors.quantity && <span className="form-error">{errors.quantity}</span>}
              </div>
            )}
            <div className="form-group">
              <label className="form-label">{t('products.lowStockThreshold')}</label>
              <input className="form-input" type="number" min="0" value={form.lowStockThreshold} onChange={e=>set('lowStockThreshold',e.target.value)}/>
            </div>
          </div>
          {form.costPrice && form.sellingPrice && (
            <div style={{ marginTop: 12, padding: '10px 16px', background: 'rgba(0,212,168,0.08)', borderRadius: 8, display: 'flex', gap: 24 }}>
              <span style={{ fontSize: 13 }}>Profit: <strong style={{ color: 'var(--teal)' }}>₹{(Number(form.sellingPrice)-Number(form.costPrice)).toFixed(2)}</strong></span>
              <span style={{ fontSize: 13 }}>Margin: <strong style={{ color: 'var(--green)' }}>{form.sellingPrice > 0 ? (((form.sellingPrice-form.costPrice)/form.sellingPrice)*100).toFixed(1) : 0}%</strong></span>
            </div>
          )}
        </div>

        {/* Supplier & Expiry */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--teal)' }}>Supplier & Batch Info</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('products.supplier')}</label>
              <select className="form-select" value={form.supplier} onChange={e=>set('supplier',e.target.value)}>
                <option value="">Select Supplier</option>
                {suppliers.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.batchNo')}</label>
              <input className="form-input" value={form.batchNo} onChange={e=>set('batchNo',e.target.value)} placeholder="e.g. BATCH-2024-01"/>
            </div>
            <div className="form-group">
              <label className="form-label">{t('products.expiryDate')}</label>
              <input className="form-input" type="date" value={form.expiryDate} onChange={e=>set('expiryDate',e.target.value)}/>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16}/> {loading ? 'Saving...' : t('products.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
