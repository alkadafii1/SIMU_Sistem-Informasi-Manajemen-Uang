FROM python:3.10-slim

WORKDIR /code

# Install package dasar
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /code/requirements.txt

# Salin semua file kode utama
COPY . .

# --- SOLUSI AMANKAN HAK AKSES FOLDER ARTIFACTS ---
# Kita buat folder artifacts, salin involves, dan ubah kepemilikannya agar bisa dibaca oleh user Hugging Face
RUN mkdir -p /code/artifacts
COPY ./artifacts /code/artifacts
RUN chown -R 1000:0 /code/artifacts && chmod -R 755 /code/artifacts

# --- TRIK SAKTI INJEKSI AUTOMATIC FOR KERAS ---
RUN echo "import keras\n\
old_init = keras.layers.Dense.__init__\n\
def new_init(self, *args, **kwargs):\n\
    kwargs.pop('quantization_config', None)\n\
    old_init(self, *args, **kwargs)\n\
keras.layers.Dense.__init__ = new_init" > /usr/local/lib/python3.10/site-packages/sitecustomize.py

# Jalankan server FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]