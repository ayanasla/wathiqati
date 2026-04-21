#!/usr/bin/env python3
import sqlite3
import subprocess
import time
import urllib.request
import urllib.error
import json
import sys
import os

# Change to backend directory
os.chdir(r'C:\Users\pc gold\Desktop\wathiqati\backend')

# Step 1: Check database
print('\n' + '='*50)
print('STEP 1: Checking database for users')
print('='*50 + '\n')

try:
    conn = sqlite3.connect('database.sqlite')
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, email, firstName, lastName, role, isActive FROM users')
    users = cursor.fetchall()
    
    print(f'Found {len(users)} user(s):\n')
    for user in users:
        print(f'  ID: {user[0]}')
        print(f'  Email: {user[1]}')
        print(f'  Name: {user[2]} {user[3]}')
        print(f'  Role: {user[4]}')
        print(f'  Active: {user[5]}')
        print()
    
    conn.close()
except Exception as e:
    print(f'Error querying database: {e}')
    sys.exit(1)

# Step 2: Start server
print('='*50)
print('STEP 2: Starting backend server')
print('='*50 + '\n')

server_proc = subprocess.Popen(
    ['node', 'server.js'],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    universal_newlines=True,
    bufsize=1
)

# Capture server output
server_started = False
for _ in range(50):  # Try for up to 10 seconds
    try:
        line = server_proc.stdout.readline()
        if line:
            print(f'[SERVER] {line.strip()}')
            if 'Server running on port' in line:
                server_started = True
                break
    except:
        pass
    time.sleep(0.2)

if not server_started:
    print('Warning: Server may not have started yet, attempting login anyway...')

time.sleep(1)  # Give server a moment to fully initialize

# Step 3: Test login
print('\n' + '='*50)
print('STEP 3: Testing login endpoint')
print('='*50 + '\n')

login_data = json.dumps({
    'email': 'admin@yaacoub.ma',
    'password': 'Admin123!'
}).encode('utf-8')

url = 'http://localhost:5002/api/auth/login'

print(f'Sending login request:')
print(f'  URL: {url}')
print(f'  Method: POST')
print(f'  Body: {login_data.decode()}\n')

try:
    req = urllib.request.Request(
        url,
        data=login_data,
        headers={
            'Content-Type': 'application/json'
        },
        method='POST'
    )
    
    with urllib.request.urlopen(req) as response:
        print(f'✓ Response received:')
        print(f'  Status Code: {response.status}')
        print(f'  Headers:')
        for header, value in response.headers.items():
            print(f'    {header}: {value}')
        
        response_body = response.read().decode('utf-8')
        print(f'\n  Body:\n{response_body}\n')
        
        try:
            parsed = json.loads(response_body)
            print('✓ Parsed JSON response:')
            print(json.dumps(parsed, indent=2))
        except:
            print('✗ Could not parse JSON')

except urllib.error.HTTPError as e:
    print(f'✓ HTTP Error Response received:')
    print(f'  Status Code: {e.code}')
    print(f'  Headers:')
    for header, value in e.headers.items():
        print(f'    {header}: {value}')
    
    error_body = e.read().decode('utf-8')
    print(f'\n  Body:\n{error_body}\n')
    
    try:
        parsed = json.loads(error_body)
        print('✓ Parsed JSON response:')
        print(json.dumps(parsed, indent=2))
    except:
        print('✗ Could not parse JSON')

except urllib.error.URLError as e:
    print(f'✗ Request error: {e.reason}')
    print('Make sure the server is running on port 5002')

except Exception as e:
    print(f'✗ Unexpected error: {e}')

# Read remaining server output
print('\n' + '='*50)
print('STEP 4: Server logs during login attempt')
print('='*50 + '\n')

try:
    while True:
        line = server_proc.stdout.readline()
        if line:
            print(f'[SERVER] {line.rstrip()}')
        else:
            time.sleep(0.1)
except KeyboardInterrupt:
    pass

# Cleanup
server_proc.terminate()
server_proc.wait(timeout=5)

print('\n' + '='*50)
print('TEST COMPLETE')
print('='*50 + '\n')
