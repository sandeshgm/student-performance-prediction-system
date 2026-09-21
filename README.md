# Student Performance Prediction API

Express + MongoDB backend that stores student records and predicts Excellent / Good / Average / Poor performance with a from-scratch Python decision tree.

The dataset is **synthetic**. Admin weights in `ml/importance.json` control how separable each feature is: higher weight means tighter clusters per class, so the tree actually follows those weights after `npm run ml:setup`. Reported accuracy is held-out test accuracy on that synthetic data, not a live college result.

## Setup

```bash
npm install
python3 -m pip install -r requirements.txt
cp .env.example .env
```

Set `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`.

```bash
npm run seed:admin
npm run ml:setup
npm run dev
```

The API listens on `http://localhost:5000` by default.

The faculty UI is in `frontend/`:

```bash
npm run frontend
```

It runs at `http://localhost:5173` and proxies `/api` to the backend (`PORT` in `.env`, currently 5001 if AirPlay is using 5000).

Existing student documents created before `overallPerformance` was calculated can be updated with:

```bash
npm run backfill:students
```

## Auth

`POST /api/admin/login` returns a JWT. Every `/api/students` route requires `Authorization: Bearer <token>`.

CORS allows only origins in `ALLOWED_ORIGINS` (comma-separated). Use `ALLOWED_ORIGINS=*` only for a trusted local demo. Include your ngrok origin explicitly if you need it.

## Student routes

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/api/students` | Create |
| GET | `/api/students` | List. Query: `semester`, `department`, `page`, `limit` (default 50, max 200) |
| GET | `/api/students/:id` | One student |
| PUT | `/api/students/:id` | Partial update allowed |
| DELETE | `/api/students/:id` | Delete |
| GET | `/api/students/dashboard` | Counts by current `overallPerformance` (from marks) and high `riskLevel` |
| GET | `/api/students/report/:id` | Structured report |
| GET | `/api/students/report/top-performers` | Query `limit` (default 5, max 50). `studentId` is the roll number |
| GET/PUT | `/api/students/feature-importance` | PUT retrains from current weights and recalculates predictions |
| GET | `/api/students/model-accuracy` | Held-out accuracy on the synthetic set |

## Machine learning

Six features go into the tree: attendance, previous GPA (0–4, default 2.5 if missing), internal / assignment / terminal scaled to 100, and behaviour scaled from six 1–5 ratings.

Each student save sends **one** Python process with every subject plus the overall vector. Retrain batches all students the same way.

`PYTHON` can point at a specific interpreter. Otherwise the API tries `python3` then `python`.

## Scripts

```bash
npm test
npm run ml:dataset
npm run ml:train
npm run ml:setup
npm run backfill:students
```
