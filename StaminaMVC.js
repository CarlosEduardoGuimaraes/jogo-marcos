/*:
 * @plugindesc Sistema de Stamina para Corrida modificável.
 * @author Cadu1209
 *
 * @param Max Stamina
 * @desc Valor máximo da barra de stamina.
 * @default 100
 *
 * @param Depletion Rate
 * @desc Quantidade de stamina gasta por frame ao correr.
 * @default 1
 *
 * @param Recovery Rate
 * @desc Quantidade de stamina recuperada por frame ao andar ou ficar parado.
 * @default 0.5
 *
 * @help
 * Este plugin implementa um sistema de stamina estruturado em 3 camadas:
 * - Model: Extensão do Game_Player para armazenar os dados.
 * - Controller: Interceptação do update loop para lógica de gasto/ganho.
 * - View: Criação de um Sprite independente para a barra na tela.
 */

(function() {
    var parameters = PluginManager.parameters('StaminaMVC');
    var maxStamina = Number(parameters['Max Stamina'] || 100);
    var depletionRate = Number(parameters['Depletion Rate'] || 1);
    var recoveryRate = Number(parameters['Recovery Rate'] || 0.5);

    // ======================================================================
    // 1. MODEL (Estrutura de Dados e Persistência)
    // ======================================================================
    
    var _Game_Player_initMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _Game_Player_initMembers.call(this);
        this._maxStamina = maxStamina;
        this._stamina = this._maxStamina;
        this._staminaExhausted = false; // Flag de regra de negócio
    };

    Game_Player.prototype.getStaminaRate = function() {
        return this._stamina / this._maxStamina;
    };

    // ======================================================================
    // 2. CONTROLLER (Regras de Negócio e Lógica de Atualização)
    // ======================================================================
    
    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        if (sceneActive) {
            this.updateStaminaLogic();
        }
    };

    Game_Player.prototype.updateStaminaLogic = function() {
        // Gasto de Stamina: Só gasta se estiver de fato se movendo rápido
        if (this.isDashing() && this.isMoving()) {
            this._stamina = Math.max(this._stamina - depletionRate, 0);
            if (this._stamina === 0) {
                this._staminaExhausted = true; // Força o jogador a parar
            }
        } else {
            // Recuperação de Stamina
            this._stamina = Math.min(this._stamina + recoveryRate, this._maxStamina);
            // Define o mínimo de porcentagem da barra para correr novamente.
            if (this._staminaExhausted && this.getStaminaRate() > 0.9) {
                this._staminaExhausted = false;
            }
        }
    };

    // Intercepta a tentativa de correr
    var _Game_Player_isDashing = Game_Player.prototype.isDashing;
    Game_Player.prototype.isDashing = function() {
        if (this._staminaExhausted || this._stamina === 0) {
            return false; // Bloqueia o dash
        }
        return _Game_Player_isDashing.call(this);
    };

    // ======================================================================
    // 3. Interface
    // ======================================================================
    
    function Sprite_StaminaBar() {
        this.initialize.apply(this, arguments);
    }
    
    Sprite_StaminaBar.prototype = Object.create(Sprite.prototype);
    Sprite_StaminaBar.prototype.constructor = Sprite_StaminaBar;

    Sprite_StaminaBar.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.createBitmap();
    };

    Sprite_StaminaBar.prototype.createBitmap = function() {
        this.bitmap = new Bitmap(104, 12);
        this.x = 20; // Posição X na tela
        this.y = 20; // Posição Y na tela
    };

    Sprite_StaminaBar.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateGraphics();
    };

    Sprite_StaminaBar.prototype.updateGraphics = function() {
        // Consome os dados do Model para atualizar a View
        var rate = $gamePlayer.getStaminaRate();
        var color = $gamePlayer._staminaExhausted ? '#ff0000' : '#00ff00'; // Vermelho se exausto, verde se normal

        this.bitmap.clear();
        // Fundo da barra
        this.bitmap.fillRect(0, 0, 104, 12, 'rgba(0, 0, 0, 0.7)'); 
        // Barra preenchida
        this.bitmap.fillRect(2, 2, 100 * rate, 8, color); 
    };

    // Injeta a View na cena do mapa
    var _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        this.createStaminaBar();
    };

    Scene_Map.prototype.createStaminaBar = function() {
        this._staminaBar = new Sprite_StaminaBar();
        this.addChild(this._staminaBar);
    };

})();