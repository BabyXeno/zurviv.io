import { type Vec2 } from "../../utils/v2";
import { Desert } from "./desert";
import { Faction } from "./faction";
import { Halloween } from "./halloween";
import { Main } from "./main";
import { Potato } from "./potato";
import { Woods } from "./woods";

export const ModeDefinitions: Record<string, ModeDefinition> = {
    main: Main,
    desert: Desert,
    woods: Woods,
    potato: Potato,
    faction: Faction,
    halloween: Halloween
};

export interface ModeDefinition {
    mapId: number
    desc: {
        name: string
        icon: string
        buttonCss: string
    }
    assets: {
        audio: Array<{
            name: string
            channel: string
        }>
        atlases: string[]
    }
    biome: {
        colors: {
            background: number
            water: number
            waterRipple: number
            beach: number
            riverbank: number
            grass: number
            underground: number
            playerSubmerge: number
        }
        valueAdjust: number
        sound: {
            riverShore: string
        }
        particles: {
            camera: string
        }
        tracerColors: Record<string, number>
        airdrop: {
            planeImg: string
            planeSound: string
            airdropImg: string
        }
    }

    gameMode: {
        maxPlayers: number
        killLeaderEnabled: boolean
    }
    gameConfig: {
        planes: {
            timings: Array<
            {
                circleIdx: number
                wait: number
                options: { type: number }
            }>
            crates: Array<{
                name: string
                weight: number
            }>
        }
        bagSizes: Record<string, number>
        bleedDamage: number
        bleedDamageMult: number
    }
    lootTable: Record<string, Array<{
        name: string
        count: number
        weight: number
    }>>
    mapGen: {
        map: {
            baseWidth: number
            baseHeight: number
            scale: { small: number, large: number }
            extension: number
            shoreInset: number
            grassInset: number
            rivers: {
                lakes: Array<{
                    odds: number
                    innerRad: number
                    outerRad: number
                    spawnBound: {
                        pos: Vec2
                        rad: number
                    }
                }>
                weights: Array<{ weight: number, widths: number[] }>
                smoothness: number
                masks: Array<{
                    pos: Vec2
                    rad: number
                }>
            }
        }
        places: Array<{ name: string, pos: Vec2 }>
        bridgeTypes: {
            medium: string
            large: string
            xlarge: string
        }
        customSpawnRules: {
            locationSpawns: Array<{
                type: string
                pos: Vec2
                rad: number
                retryOnFailure: boolean
            }>
            placeSpawns: string[]
        }
        densitySpawns: Array<Record<string, number>>
        fixedSpawns: Array<
        Record<string,
        number | { odds: number } | { small: number, large: number }
        >
        >
        randomSpawns: Array<{
            spawns: string[]
            choose: number
        }>
        spawnReplacements: Array<Record<string, string>>
        importantSpawns: string[]
    }
}
