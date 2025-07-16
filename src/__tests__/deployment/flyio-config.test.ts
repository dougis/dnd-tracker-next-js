import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Fly.io Configuration Tests', () => {
  const projectRoot = path.join(__dirname, '../../..');
  
  it('should have correct port configuration in fly.toml', () => {
    const flyTomlPath = path.join(projectRoot, 'fly.toml');
    const flyTomlContent = fs.readFileSync(flyTomlPath, 'utf8');
    
    // Check that internal_port is set to 8080
    expect(flyTomlContent).toMatch(/internal_port\s*=\s*8080/);
  });
  
  it('should have correct port configuration in package.json start script', () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    
    // Check that start script uses port 8080 and binds to 0.0.0.0
    expect(packageJson.scripts.start).toContain('-H 0.0.0.0');
    expect(packageJson.scripts.start).toContain('-p 8080');
  });
  
  it('should have correct port exposed in Dockerfile', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile');
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    
    // Check that Dockerfile exposes port 8080
    expect(dockerfileContent).toMatch(/EXPOSE\s+8080/);
  });
  
  it('should have health check configured for correct port', () => {
    const dockerfilePath = path.join(projectRoot, 'Dockerfile');
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    
    // Check that health check uses port 8080
    expect(dockerfileContent).toMatch(/localhost:8080\/api\/health/);
  });
});