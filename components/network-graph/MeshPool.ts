/**
 * Object Pool for Three.js meshes - prevents memory churn
 * Used by NetworkGraph3d for efficient mesh reuse
 */

import * as THREE from "three";
import { SHARED_GEOMETRIES } from "./shared/pulse-effects";

export interface PooledMesh extends THREE.Mesh {
  __poolType?: "sphere" | "sphereLow" | "torus";
}

export class MeshPool {
  private spherePool: PooledMesh[] = [];
  private sphereLowPool: PooledMesh[] = [];
  private torusPool: PooledMesh[] = [];
  private activeCount = 0;

  acquire(
    type: "sphere" | "sphereLow" | "torus",
    color: THREE.Color,
    opacity: number,
    scale: number
  ): PooledMesh {
    let mesh: PooledMesh | undefined;
    const pool =
      type === "sphere"
        ? this.spherePool
        : type === "sphereLow"
        ? this.sphereLowPool
        : this.torusPool;

    mesh = pool.pop();

    if (!mesh) {
      // Create new mesh only if pool is empty
      const geometry =
        type === "torus"
          ? SHARED_GEOMETRIES.torus
          : type === "sphereLow"
          ? SHARED_GEOMETRIES.sphereLow
          : SHARED_GEOMETRIES.sphere;

      mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          color: color.clone(),
          transparent: true,
          opacity,
          side: type === "torus" ? THREE.DoubleSide : THREE.FrontSide,
        })
      ) as PooledMesh;
      mesh.__poolType = type;

      if (type === "torus") {
        mesh.rotation.x = Math.PI / 2;
      }
    } else {
      // Reuse existing mesh - update its material properties
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.color.copy(color);
      material.opacity = opacity;
      material.visible = true;
    }

    mesh.scale.setScalar(scale);
    mesh.visible = true;
    this.activeCount++;
    return mesh;
  }

  release(mesh: PooledMesh): void {
    mesh.visible = false;
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    this.activeCount--;

    const pool =
      mesh.__poolType === "sphere"
        ? this.spherePool
        : mesh.__poolType === "sphereLow"
        ? this.sphereLowPool
        : this.torusPool;

    // Limit pool size to prevent unbounded growth
    if (pool.length < 500) {
      pool.push(mesh);
    } else {
      // Dispose if pool is full
      (mesh.material as THREE.Material).dispose();
    }
  }

  releaseGroup(group: THREE.Group): void {
    // Release all children back to pool
    const children = [...group.children] as PooledMesh[];
    for (const child of children) {
      if (child.__poolType) {
        this.release(child);
      } else {
        group.remove(child);
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.Material).dispose();
        }
      }
    }
  }

  dispose(): void {
    const allPools = [this.spherePool, this.sphereLowPool, this.torusPool];
    for (const pool of allPools) {
      for (const mesh of pool) {
        (mesh.material as THREE.Material).dispose();
      }
      pool.length = 0;
    }
    this.activeCount = 0;
  }

  getStats() {
    return {
      active: this.activeCount,
      pooled:
        this.spherePool.length +
        this.sphereLowPool.length +
        this.torusPool.length,
    };
  }
}
