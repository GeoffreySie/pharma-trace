import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import QRCode from 'qrcode';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const provider = new WsProvider('ws://127.0.0.1:9944'); // Ensure this matches your node's URL
let api: ApiPromise;

const connect = async () => {
  try {
    api = await ApiPromise.create({ provider });
    console.log('Connected to Substrate node');
  } catch (error) {
    console.error('Failed to connect to Substrate node:', error);
  }
};
connect();

const products: { [key: string]: any } = {};

app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running');
});

app.post('/register', async (req: Request, res: Response) => {
  const { productId, productName, status } = req.body;
  const productData = { productId, productName, status, history: [{ status, timestamp: new Date() }] };
  products[productId] = productData;

  // Encode only the product ID in the QR code
  const qrCode = await QRCode.toDataURL(productId);
  res.json({ qrCode });
});

app.post('/update-status', async (req: Request, res: Response) => {
  const { productId, newStatus } = req.body;
  if (!products[productId]) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[productId].status = newStatus;
  products[productId].history.push({ status: newStatus, timestamp: new Date() });

  try {
    const keyring = new Keyring({ type: 'sr25519' });
    const alice = keyring.addFromUri('//Alice');

    await api.tx.templateModule
      .updateProductStatus(productId, newStatus)
      .signAndSend(alice);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating status on Substrate:', error);
    res.status(500).json({ error: 'Failed to update status on blockchain' });
  }
});

app.get('/product/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;
  const product = products[productId];
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.listen(3000, () => console.log('Server running on port 3000'));